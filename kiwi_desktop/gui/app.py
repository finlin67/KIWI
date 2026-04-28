"""PySide6 app entrypoint."""

from __future__ import annotations

import sys
from pathlib import Path

from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication

from gui.main_window import MainWindow


def _resolve_app_icon() -> Path | None:
    """Resolve the preferred desktop icon path from known workspace locations."""
    repo_root = Path(__file__).resolve().parents[2]
    preferred_paths = (
        repo_root / "KIWI_Web" / "public" / "favico.ico",
        repo_root / "images" / "kiwifav.ico",
    )
    for icon_path in preferred_paths:
        if icon_path.exists():
            return icon_path
    return None


def _set_windows_app_user_model_id() -> None:
    """Set explicit AppUserModelID so Windows taskbar uses KIWI identity/icon."""
    if sys.platform != "win32":
        return
    try:
        import ctypes

        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(
            "KIWI.KnowledgeIntakeWorkbench"
        )
    except Exception:
        # Non-fatal: app can still run if this call is unavailable.
        pass


def run_gui() -> int:
    _set_windows_app_user_model_id()
    app = QApplication(sys.argv)
    icon_path = _resolve_app_icon()
    if icon_path is not None:
        app.setWindowIcon(QIcon(str(icon_path)))
    win = MainWindow()
    if icon_path is not None:
        win.setWindowIcon(QIcon(str(icon_path)))
    win.show()
    return app.exec()
