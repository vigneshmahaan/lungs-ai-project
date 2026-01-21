from __future__ import annotations

"""
Utility: generate backend/dataset/icbhi_2017/metadata.csv from a folder layout.

Recommended layout:
backend/dataset/icbhi_2017/audio/
  Asthma/
  Bronchitis/
  COPD/
  Normal/
  Pneumonia/

Put your audio files (wav/mp3) into the matching class folder.

Run:
  cd backend
  python -m ml.make_metadata
"""

import os
from pathlib import Path

import pandas as pd

from .config import ModelConfig


def main() -> None:
    model_cfg = ModelConfig()

    dataset_root = Path("dataset") / "icbhi_2017"
    audio_root = dataset_root / "audio"
    out_csv = dataset_root / "metadata.csv"

    if not audio_root.exists():
        raise FileNotFoundError(f"Missing folder: {audio_root}")

    rows = []
    allowed_ext = {".wav", ".mp3"}

    # Accept either exact class folders or lowercase variants.
    class_dirs = {}
    for c in model_cfg.classes:
        class_dirs[c] = audio_root / c
        if not class_dirs[c].exists():
            class_dirs[c] = audio_root / c.lower()

    missing = [c for c, p in class_dirs.items() if not p.exists()]
    if missing:
        raise FileNotFoundError(
            "Missing class folders under audio/. Create these folders and put files inside:\n"
            + "\n".join([f"- {audio_root / c}" for c in missing])
        )

    for label, folder in class_dirs.items():
        for p in sorted(folder.rglob("*")):
            if not p.is_file():
                continue
            if p.suffix.lower() not in allowed_ext:
                continue
            # Store filename relative to audio_root (supports nested subfolders)
            rel = p.relative_to(audio_root).as_posix()
            rows.append({"filename": rel, "label": label})

    if not rows:
        raise ValueError(f"No .wav/.mp3 files found under {audio_root}")

    df = pd.DataFrame(rows).sort_values(["label", "filename"]).reset_index(drop=True)
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_csv, index=False)
    print(f"Wrote {len(df)} rows to {out_csv}")
    print("Example rows:")
    print(df.head(10).to_string(index=False))


if __name__ == "__main__":
    main()

