"""Row mapped to ``files``."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

@dataclass(frozen=True, slots=True)
class FileRecord:
    id: int
    path: str
    filename: str | None
    extension: str | None
    file_created_at: datetime | None
    file_modified_at: datetime | None
    display_name: str | None
    size_bytes: int | None
    sha256: str | None
    mime_type: str | None
    current_stage: str
    stage_checkpoint: str | None
    pipeline_version: int
    stage_attempt: int
    last_error: str | None
    runner_status: str
    pipeline_next_stage: str | None
    workspace: str | None
    subfolder: str | None
    matched_by: str | None
    classification_reason: str | None
    review_required: bool
    ai_used: bool
    content_hash: str | None
    confidence: float | None
    case_study_candidate: bool
    portfolio_candidate: bool
    normalized_hash: str | None
    word_count: int | None
    char_count: int | None
    evidence_score: float | None
    case_study_readiness: str
    archive_status: str
    archive_reason: str | None
    matched_positive_keywords: str | None
    matched_negative_keywords: str | None
    duplicate_of: int | None
    suggested_workspaces: str | None
    suggested_subfolders: str | None
    evidence_card_path: str | None
    created_at: datetime | None
    updated_at: datetime | None

    @classmethod
    def from_row(cls, row: Any) -> FileRecord:
        return cls(
            id=int(row["id"]),
            path=str(row["path"]),
            filename=row["filename"],
            extension=row["extension"],
            file_created_at=_parse_dt(row["file_created_at"]),
            file_modified_at=_parse_dt(row["file_modified_at"]),
            display_name=row["display_name"],
            size_bytes=row["size_bytes"],
            sha256=row["sha256"],
            mime_type=row["mime_type"],
            current_stage=str(row["current_stage"]),
            stage_checkpoint=row["stage_checkpoint"],
            pipeline_version=int(row["pipeline_version"]),
            stage_attempt=int(row["stage_attempt"]),
            last_error=row["last_error"],
            runner_status=str(row["runner_status"]),
            pipeline_next_stage=row["pipeline_next_stage"],
            workspace=_workspace_cell(row["workspace"]),
            subfolder=row["subfolder"],
            matched_by=row["matched_by"],
            classification_reason=row["classification_reason"],
            review_required=_sqlite_int_as_bool(row["review_required"]),
            ai_used=_sqlite_int_as_bool(row["ai_used"]),
            content_hash=row["content_hash"],
            confidence=_confidence_cell(row["confidence"]),
            case_study_candidate=_sqlite_int_as_bool(row["case_study_candidate"]),
            portfolio_candidate=_sqlite_int_as_bool(row["portfolio_candidate"]),
            normalized_hash=row["normalized_hash"],
            word_count=_int_cell(row["word_count"]),
            char_count=_int_cell(row["char_count"]),
            evidence_score=_confidence_cell(row["evidence_score"]),
            case_study_readiness=str(row["case_study_readiness"] or "none"),
            archive_status=str(row["archive_status"] or "keep"),
            archive_reason=row["archive_reason"],
            matched_positive_keywords=row["matched_positive_keywords"],
            matched_negative_keywords=row["matched_negative_keywords"],
            duplicate_of=_int_cell(row["duplicate_of"]),
            suggested_workspaces=row["suggested_workspaces"],
            suggested_subfolders=row["suggested_subfolders"],
            evidence_card_path=row["evidence_card_path"],
            created_at=_parse_dt(row["created_at"]),
            updated_at=_parse_dt(row["updated_at"]),
        )


def _confidence_cell(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return round(float(value), 3)
    except (TypeError, ValueError):
        return None


def _int_cell(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _workspace_cell(value: Any) -> str | None:
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _sqlite_int_as_bool(value: Any) -> bool:
    if value is None:
        return False
    try:
        return int(value) != 0
    except (TypeError, ValueError):
        return False
