"""KIWI v2 local-first evidence scoring, routing, cards, and manifests."""

from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from db.repositories import FileRepository
from models.file_record import FileRecord

MIN_WORDS = 150
MIN_CHARS = 800
HIGH_VALUE_SCORE = 70
REVIEW_SCORE = 35

KEEP_HIGH_VALUE = "KEEP_HIGH_VALUE"
KEEP_REVIEW = "KEEP_REVIEW"
ARCHIVE_TOO_SMALL = "ARCHIVE_TOO_SMALL"
ARCHIVE_DUPLICATE = "ARCHIVE_DUPLICATE"
ARCHIVE_LOW_VALUE = "ARCHIVE_LOW_VALUE"

_POSITIVE_KEYWORDS = {
    "case study": 16,
    "outcome": 12,
    "results": 12,
    "impact": 12,
    "before": 8,
    "after": 8,
    "problem": 8,
    "solution": 8,
    "implementation": 8,
    "customer": 8,
    "client": 8,
    "metric": 10,
    "roi": 12,
    "revenue": 10,
    "cost savings": 12,
    "timeline": 6,
    "lessons learned": 10,
    "recommendation": 8,
}

_NEGATIVE_KEYWORDS = {
    "draft": 8,
    "todo": 10,
    "placeholder": 12,
    "lorem ipsum": 20,
    "meeting notes": 5,
    "scratch": 8,
    "temporary": 8,
}

_WORKSPACE_KEYWORDS = {
    "sales": "Sales Enablement",
    "customer": "Customer Evidence",
    "client": "Customer Evidence",
    "product": "Product Knowledge",
    "engineering": "Engineering",
    "support": "Support Knowledge",
    "legal": "Legal",
    "finance": "Finance",
    "case study": "Case Studies",
}

_SUBFOLDER_KEYWORDS = {
    "case study": "case_studies",
    "results": "outcomes",
    "metric": "outcomes",
    "implementation": "implementation",
    "lesson": "lessons_learned",
    "proposal": "proposals",
}


@dataclass(frozen=True, slots=True)
class EvidenceResult:
    normalized_hash: str
    word_count: int
    char_count: int
    evidence_score: float
    case_study_readiness: str
    archive_status: str
    archive_reason: str
    route: str
    matched_positive_keywords: tuple[str, ...]
    matched_negative_keywords: tuple[str, ...]
    duplicate_of: int | None
    suggested_workspaces: tuple[str, ...]
    suggested_subfolders: tuple[str, ...]
    evidence_card_path: Path


class EvidencePipelineService:
    """Adds the optional v2 evidence layer after normalization and before export."""

    __slots__ = ("_files", "_export_root")

    def __init__(self, *, files: FileRepository, export_root: Path) -> None:
        self._files = files
        self._export_root = export_root

    def process(self, *, record: FileRecord, normalized_path: Path, checkpoint: dict[str, object]) -> EvidenceResult:
        text = normalized_path.read_text(encoding="utf-8", errors="ignore")
        body = _strip_frontmatter(text)
        normalized_text = _normalize_text(body)
        normalized_hash = hashlib.sha256(normalized_text.encode("utf-8")).hexdigest()
        words = re.findall(r"\b[\w'-]+\b", body)
        word_count = len(words)
        char_count = len(body)
        positive = _matched_keywords(normalized_text, _POSITIVE_KEYWORDS)
        negative = _matched_keywords(normalized_text, _NEGATIVE_KEYWORDS)
        duplicate_of = self._find_duplicate(record.id, normalized_hash)
        score = _score(word_count=word_count, char_count=char_count, positive=positive, negative=negative)
        readiness = _readiness(score)
        route, archive_status, archive_reason = _route(
            word_count=word_count,
            char_count=char_count,
            score=score,
            duplicate_of=duplicate_of,
        )
        suggested_workspaces = _suggestions(normalized_text, _WORKSPACE_KEYWORDS)
        suggested_subfolders = _suggestions(normalized_text, _SUBFOLDER_KEYWORDS)
        evidence_card_path = self._write_card(
            record=record,
            normalized_path=normalized_path,
            normalized_hash=normalized_hash,
            word_count=word_count,
            char_count=char_count,
            score=score,
            readiness=readiness,
            route=route,
            archive_status=archive_status,
            archive_reason=archive_reason,
            positive=positive,
            negative=negative,
            duplicate_of=duplicate_of,
            suggested_workspaces=suggested_workspaces,
            suggested_subfolders=suggested_subfolders,
            checkpoint=checkpoint,
        )
        self._copy_routed_file(normalized_path=normalized_path, route=route)
        result = EvidenceResult(
            normalized_hash=normalized_hash,
            word_count=word_count,
            char_count=char_count,
            evidence_score=score,
            case_study_readiness=readiness,
            archive_status=archive_status,
            archive_reason=archive_reason,
            route=route,
            matched_positive_keywords=tuple(positive),
            matched_negative_keywords=tuple(negative),
            duplicate_of=duplicate_of,
            suggested_workspaces=tuple(suggested_workspaces),
            suggested_subfolders=tuple(suggested_subfolders),
            evidence_card_path=evidence_card_path,
        )
        self._persist(record.id, result)
        self.write_manifests()
        return result

    def write_manifests(self) -> None:
        rows = self._manifest_rows()
        manifests = self._export_root / "manifests"
        manifests.mkdir(parents=True, exist_ok=True)
        fields = [
            "id",
            "path",
            "filename",
            "normalized_hash",
            "word_count",
            "char_count",
            "evidence_score",
            "case_study_readiness",
            "archive_status",
            "archive_reason",
            "duplicate_of",
            "suggested_workspaces",
            "suggested_subfolders",
            "evidence_card_path",
        ]
        with (manifests / "manifest.csv").open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)
        with (manifests / "manifest.jsonl").open("w", encoding="utf-8", newline="\n") as f:
            for row in rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
        summary = self.audit_summary(rows)
        with (manifests / "batch_summary.csv").open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["metric", "value"])
            for key, value in summary.items():
                writer.writerow([key, json.dumps(value, ensure_ascii=False) if isinstance(value, (list, dict)) else value])
        (manifests / "run_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    def audit_summary(self, rows: list[dict[str, object]] | None = None) -> dict[str, object]:
        data = rows if rows is not None else self._manifest_rows()
        total = len(data)
        duplicates = sum(1 for r in data if r.get("duplicate_of") not in (None, ""))
        too_small = sum(1 for r in data if r.get("archive_reason") == ARCHIVE_TOO_SMALL)
        high_value = sum(1 for r in data if r.get("archive_status") == "keep")
        review = sum(1 for r in data if r.get("archive_status") == "review")
        archive = sum(1 for r in data if r.get("archive_status") == "archive")
        keyword_counter: Counter[str] = Counter()
        scores: list[float] = []
        for row in data:
            scores.append(float(row.get("evidence_score") or 0.0))
            for key in _json_list(row.get("matched_positive_keywords")):
                keyword_counter[key] += 1
        quality = round(sum(scores) / max(1, total), 2)
        return {
            "total_files_scanned": total,
            "duplicates": duplicates,
            "too_small": too_small,
            "high_value": high_value,
            "review": review,
            "archive": archive,
            "estimated_ai_calls": high_value + review,
            "top_matched_keywords": keyword_counter.most_common(10),
            "batch_quality_score": quality,
        }

    def _find_duplicate(self, file_id: int, normalized_hash: str) -> int | None:
        conn = self._files._db.connect()
        row = conn.execute(
            """
            SELECT id FROM files
            WHERE normalized_hash = ? AND id != ?
            ORDER BY id ASC
            LIMIT 1
            """,
            (normalized_hash, file_id),
        ).fetchone()
        return None if row is None else int(row["id"])

    def _write_card(self, **payload: object) -> Path:
        record = payload["record"]
        if not isinstance(record, FileRecord):
            raise TypeError("record must be a FileRecord")
        card_dir = self._export_root / "evidence_cards"
        card_dir.mkdir(parents=True, exist_ok=True)
        card_path = card_dir / f"{record.id:06d}_{_safe_name(record.filename or Path(record.path).name)}.json"
        card = {
            "file_id": record.id,
            "source_path": record.path,
            "source_file": record.filename or Path(record.path).name,
            "normalized_path": str(payload["normalized_path"]),
            "normalized_hash": payload["normalized_hash"],
            "word_count": payload["word_count"],
            "char_count": payload["char_count"],
            "evidence_score": payload["score"],
            "case_study_readiness": payload["readiness"],
            "route": payload["route"],
            "archive_status": payload["archive_status"],
            "archive_reason": payload["archive_reason"],
            "matched_positive_keywords": payload["positive"],
            "matched_negative_keywords": payload["negative"],
            "duplicate_of": payload["duplicate_of"],
            "suggested_workspaces": payload["suggested_workspaces"],
            "suggested_subfolders": payload["suggested_subfolders"],
            "explainable_routing": _explain(payload),
            "checkpoint": payload["checkpoint"],
        }
        card_path.write_text(json.dumps(card, indent=2, ensure_ascii=False), encoding="utf-8")
        return card_path

    def _copy_routed_file(self, *, normalized_path: Path, route: str) -> None:
        base = self._export_root / "evidence" if route in {KEEP_HIGH_VALUE, KEEP_REVIEW} else self._export_root / "archive"
        target_dir = base / route
        target_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(normalized_path, target_dir / normalized_path.name)

    def _persist(self, file_id: int, result: EvidenceResult) -> None:
        self._files.update_evidence_fields(
            file_id,
            {
                "normalized_hash": result.normalized_hash,
                "word_count": result.word_count,
                "char_count": result.char_count,
                "evidence_score": result.evidence_score,
                "case_study_readiness": result.case_study_readiness,
                "archive_status": result.archive_status,
                "archive_reason": result.archive_reason,
                "matched_positive_keywords": json.dumps(result.matched_positive_keywords, ensure_ascii=False),
                "matched_negative_keywords": json.dumps(result.matched_negative_keywords, ensure_ascii=False),
                "duplicate_of": result.duplicate_of,
                "suggested_workspaces": json.dumps(result.suggested_workspaces, ensure_ascii=False),
                "suggested_subfolders": json.dumps(result.suggested_subfolders, ensure_ascii=False),
                "evidence_card_path": str(result.evidence_card_path),
            },
        )

    def _manifest_rows(self) -> list[dict[str, object]]:
        return [
            {
                "id": r.id,
                "path": r.path,
                "filename": r.filename,
                "normalized_hash": r.normalized_hash,
                "word_count": r.word_count,
                "char_count": r.char_count,
                "evidence_score": r.evidence_score,
                "case_study_readiness": r.case_study_readiness,
                "archive_status": r.archive_status,
                "archive_reason": r.archive_reason,
                "matched_positive_keywords": r.matched_positive_keywords,
                "matched_negative_keywords": r.matched_negative_keywords,
                "duplicate_of": r.duplicate_of,
                "suggested_workspaces": r.suggested_workspaces,
                "suggested_subfolders": r.suggested_subfolders,
                "evidence_card_path": r.evidence_card_path,
            }
            for r in self._files.list_recent(limit=100000)
            if r.normalized_hash
        ]


def _strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text
    parts = text.split("---", 2)
    return parts[2] if len(parts) == 3 else text


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.casefold()).strip()


def _matched_keywords(text: str, weights: dict[str, int]) -> list[str]:
    return [keyword for keyword in weights if keyword in text]


def _score(*, word_count: int, char_count: int, positive: list[str], negative: list[str]) -> float:
    size_points = min(30.0, (word_count / MIN_WORDS) * 15.0 + (char_count / MIN_CHARS) * 15.0)
    positive_points = min(60.0, sum(_POSITIVE_KEYWORDS[k] for k in positive))
    negative_penalty = min(40.0, sum(_NEGATIVE_KEYWORDS[k] for k in negative))
    return round(max(0.0, min(100.0, size_points + positive_points - negative_penalty)), 2)


def _readiness(score: float) -> str:
    if score >= HIGH_VALUE_SCORE:
        return "strong"
    if score >= 55:
        return "moderate"
    if score >= REVIEW_SCORE:
        return "weak"
    return "none"


def _route(*, word_count: int, char_count: int, score: float, duplicate_of: int | None) -> tuple[str, str, str]:
    if duplicate_of is not None:
        return ARCHIVE_DUPLICATE, "archive", ARCHIVE_DUPLICATE
    if word_count < MIN_WORDS or char_count < MIN_CHARS:
        return ARCHIVE_TOO_SMALL, "archive", ARCHIVE_TOO_SMALL
    if score >= HIGH_VALUE_SCORE:
        return KEEP_HIGH_VALUE, "keep", KEEP_HIGH_VALUE
    if score >= REVIEW_SCORE:
        return KEEP_REVIEW, "review", KEEP_REVIEW
    return ARCHIVE_LOW_VALUE, "archive", ARCHIVE_LOW_VALUE


def _suggestions(text: str, mapping: dict[str, str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for keyword, value in mapping.items():
        if keyword in text and value not in seen:
            seen.add(value)
            out.append(value)
    return out


def _safe_name(name: str) -> str:
    return "".join(c if c.isalnum() or c in "-_ ." else "_" for c in Path(name).stem)[:100] or "document"


def _json_list(value: object) -> list[str]:
    if not isinstance(value, str) or not value.strip():
        return []
    try:
        raw = json.loads(value)
    except json.JSONDecodeError:
        return []
    if not isinstance(raw, list):
        return []
    return [str(v) for v in raw]


def _explain(payload: dict[str, object]) -> str:
    reasons = [
        f"route={payload['route']}",
        f"score={payload['score']}",
        f"words={payload['word_count']}",
        f"chars={payload['char_count']}",
    ]
    if payload.get("duplicate_of") is not None:
        reasons.append(f"duplicate_of={payload['duplicate_of']}")
    positive = payload.get("positive")
    negative = payload.get("negative")
    if positive:
        reasons.append(f"positive_keywords={', '.join(str(v) for v in positive)}")
    if negative:
        reasons.append(f"negative_keywords={', '.join(str(v) for v in negative)}")
    reasons.append(f"archive_status={payload['archive_status']}")
    reasons.append(f"archive_reason={payload['archive_reason']}")
    return "; ".join(reasons)
