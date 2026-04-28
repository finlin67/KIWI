from __future__ import annotations

import subprocess
import sys
from pathlib import Path
import tkinter as tk
from tkinter import messagebox


def _resolve_launcher_icon(root_dir: Path) -> Path | None:
    """Resolve launcher icon from known project locations."""
    candidates = (
        root_dir / "KIWI_Web" / "public" / "favico.ico",
        root_dir / "images" / "kiwifav.ico",
    )
    for icon_path in candidates:
        if icon_path.exists():
            return icon_path
    return None


def _set_windows_app_user_model_id() -> None:
    """Set explicit AppUserModelID so Windows taskbar uses KIWI launcher identity."""
    if sys.platform != "win32":
        return
    try:
        import ctypes

        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("KIWI.Launcher")
    except Exception:
        # Non-fatal: launcher still works if this call is unavailable.
        pass


def get_root_dir() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent.parent


def run_start_here(flag: str) -> None:
    root_dir = get_root_dir()
    start_here = root_dir / "Start Here.bat"

    if not start_here.exists():
        messagebox.showerror("KIWI Launcher", f"Missing file:\n{start_here}")
        return

    try:
        subprocess.Popen(["cmd", "/c", str(start_here), flag], cwd=str(root_dir))
    except OSError as exc:
        messagebox.showerror("KIWI Launcher", f"Failed to launch:\n{exc}")


def main() -> None:
    _set_windows_app_user_model_id()
    root_dir = get_root_dir()
    root = tk.Tk()
    root.title("KIWI Launcher")
    root.geometry("420x250")
    root.resizable(False, False)

    icon_path = _resolve_launcher_icon(root_dir)
    if icon_path is not None:
        try:
            root.iconbitmap(default=str(icon_path))
        except tk.TclError:
            pass

    container = tk.Frame(root, padx=18, pady=18)
    container.pack(fill="both", expand=True)

    title = tk.Label(container, text="KIWI Launcher", font=("Segoe UI", 16, "bold"))
    title.pack(anchor="w")

    subtitle = tk.Label(
        container,
        text="Use this to run setup, start KIWI, or stop KIWI.",
        font=("Segoe UI", 10),
    )
    subtitle.pack(anchor="w", pady=(4, 14))

    start_button = tk.Button(
        container,
        text="Start KIWI",
        width=28,
        height=2,
        command=lambda: run_start_here("--start"),
    )
    start_button.pack(pady=4)

    setup_button = tk.Button(
        container,
        text="First-time Setup",
        width=28,
        height=2,
        command=lambda: run_start_here("--setup"),
    )
    setup_button.pack(pady=4)

    stop_button = tk.Button(
        container,
        text="Stop KIWI",
        width=28,
        height=2,
        command=lambda: run_start_here("--stop"),
    )
    stop_button.pack(pady=4)

    note = tk.Label(
        container,
        text="This launcher calls Start Here.bat. Core KIWI behavior is unchanged.",
        font=("Segoe UI", 9),
        fg="#444444",
    )
    note.pack(anchor="w", pady=(14, 0))

    root.mainloop()


if __name__ == "__main__":
    main()
