from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from dependencies import get_active_context, serialize_context

router = APIRouter(prefix="/monitor", tags=["monitor"])


def _monitor_service() -> Any:
    try:
        from services.run_monitor_service import RunMonitorService  # type: ignore
    except ImportError as exc:
        raise HTTPException(status_code=500, detail=f"RunMonitorService import failed: {exc}") from exc
    return RunMonitorService()


@router.get("/preflight")
def preflight(session_token: str = Query(...)) -> dict[str, Any]:
    context = get_active_context(session_token)
    service = _monitor_service()
    summary = service.get_preflight_summary(context)
    return {"summary": serialize_context(summary)}


@router.get("/evidence-audit")
def evidence_audit(session_token: str = Query(...)) -> dict[str, Any]:
    context = get_active_context(session_token)
    try:
        from db.repositories import FileRepository  # type: ignore
        from db.session import Database  # type: ignore
        from services.evidence_pipeline_service import EvidencePipelineService  # type: ignore
    except ImportError as exc:
        raise HTTPException(status_code=500, detail=f"Evidence audit imports failed: {exc}") from exc
    db = Database(context.db_path)
    db.connect()
    try:
        files = FileRepository(db)
        service = EvidencePipelineService(files=files, export_root=context.output_folder / "exports")
        summary = service.audit_summary()
        return {"summary": serialize_context(summary)}
    finally:
        db.close()

