from __future__ import annotations

"""
Training pipeline for the ICBHI 2017 Respiratory Sound Dataset.

Expected dataset layout (suggested):
backend/dataset/icbhi_2017/
  - audio/            (wav files)
  - metadata.csv      (must map filename -> disease label)

Because ICBHI dataset distributions/metadata vary by source, this script is written
to be easy to adapt: update `load_metadata()` to match your metadata format.

Outputs:
  backend/model/model.h5
"""

import os
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

from .config import AudioConfig, FeatureConfig, ModelConfig
from .features import extract_all_features
from .modeling import build_cnn
from .preprocess import normalize, pad_or_trim, reduce_noise, resample


@dataclass(frozen=True)
class TrainPaths:
    dataset_root: str = os.path.join("dataset", "icbhi_2017")
    audio_dir: str = os.path.join("dataset", "icbhi_2017", "audio")
    metadata_csv: str = os.path.join("dataset", "icbhi_2017", "metadata.csv")
    model_out: str = os.path.join("model", "model.h5")


def load_metadata(paths: TrainPaths, classes: List[str]) -> pd.DataFrame:
    """
    Minimal contract: a CSV with columns:
      - filename: audio filename (relative to audio_dir)
      - label: one of ModelConfig.classes
    """
    if not os.path.exists(paths.metadata_csv):
        raise FileNotFoundError(
            f"Missing metadata CSV at {paths.metadata_csv}. "
            "Create it with columns: filename,label"
        )
    df = pd.read_csv(paths.metadata_csv)
    if "filename" not in df.columns or "label" not in df.columns:
        raise ValueError("metadata.csv must contain columns: filename,label")
    df = df[df["label"].isin(classes)].copy()
    if df.empty:
        raise ValueError("No rows with valid labels found in metadata.csv.")
    return df


def augment(y: np.ndarray, sr: int, rng: np.random.Generator) -> np.ndarray:
    """
    Simple augmentation:
    - random gain
    - mild time shift
    - optional gaussian noise
    """
    out = y.copy()
    gain = rng.uniform(0.8, 1.2)
    out = out * gain

    shift = int(rng.uniform(-0.1, 0.1) * len(out))
    out = np.roll(out, shift)

    if rng.random() < 0.35:
        noise = rng.normal(0, 0.005, size=out.shape).astype(np.float32)
        out = out + noise

    return out.astype(np.float32)


def build_example(
    wav_path: str,
    audio_cfg: AudioConfig,
    feat_cfg: FeatureConfig,
    do_augment: bool,
    rng: np.random.Generator,
) -> np.ndarray:
    import soundfile as sf

    y, sr = sf.read(wav_path, dtype="float32", always_2d=False)
    if y.ndim > 1:
        y = np.mean(y, axis=1).astype(np.float32)
    y, sr = resample(y, int(sr), audio_cfg)
    y = reduce_noise(y)
    if do_augment:
        y = augment(y, sr, rng)
    y = normalize(y)
    y = pad_or_trim(y, sr, audio_cfg)
    x, _ = extract_all_features(y, sr, feat_cfg)
    return x


def main() -> None:
    tf.random.set_seed(42)
    rng = np.random.default_rng(42)

    audio_cfg = AudioConfig()
    feat_cfg = FeatureConfig()
    model_cfg = ModelConfig()
    paths = TrainPaths()

    df = load_metadata(paths, model_cfg.classes)
    label_to_idx = {c: i for i, c in enumerate(model_cfg.classes)}
    y_all = df["label"].map(label_to_idx).astype(int).values

    train_df, test_df = train_test_split(
        df,
        test_size=0.2,
        random_state=42,
        stratify=y_all,
    )

    # Build features in-memory (simple + reviewable). For larger sets, use tf.data + caching.
    def build_set(split_df: pd.DataFrame, augment_on: bool) -> Tuple[np.ndarray, np.ndarray]:
        xs: List[np.ndarray] = []
        ys: List[int] = []
        for _, row in split_df.iterrows():
            wav_path = os.path.join(paths.audio_dir, str(row["filename"]))
            if not os.path.exists(wav_path):
                continue
            x = build_example(wav_path, audio_cfg, feat_cfg, do_augment=augment_on, rng=rng)
            xs.append(x)
            ys.append(int(label_to_idx[str(row["label"])]))
        if not xs:
            raise ValueError("No audio files found. Check your dataset paths/metadata.")
        return np.stack(xs, axis=0), np.array(ys, dtype=np.int64)

    x_train, y_train = build_set(train_df, augment_on=True)
    x_test, y_test = build_set(test_df, augment_on=False)

    class_weights = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(y_train),
        y=y_train,
    )
    class_weight_map = {int(c): float(w) for c, w in zip(np.unique(y_train), class_weights)}

    model = build_cnn(input_shape=x_train.shape[1:])
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=8, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4),
    ]

    model.fit(
        x_train,
        y_train,
        validation_split=0.2,
        epochs=60,
        batch_size=16,
        class_weight=class_weight_map,
        callbacks=callbacks,
        verbose=1,
    )

    test_loss, test_acc = model.evaluate(x_test, y_test, verbose=0)
    print(f"Test accuracy: {test_acc:.4f}  loss: {test_loss:.4f}")

    os.makedirs(os.path.dirname(paths.model_out), exist_ok=True)
    model.save(paths.model_out)
    print(f"Saved model to {paths.model_out}")


if __name__ == "__main__":
    main()

