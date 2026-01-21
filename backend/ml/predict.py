from __future__ import annotations

import os
from typing import Dict, Tuple

import numpy as np
import tensorflow as tf

from .config import AudioConfig, FeatureConfig, ModelConfig
from .features import extract_all_features
from .modeling import build_cnn
from .preprocess import preprocess_audio


def _ensure_model(model_path: str, input_shape: Tuple[int, int, int]) -> tf.keras.Model:
    """
    Load trained model if present; otherwise create a baseline untrained model and save it.
    This keeps the demo runnable out-of-the-box while still supporting proper training via ml/train.py.
    """
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    if os.path.exists(model_path):
        return tf.keras.models.load_model(model_path)

    model = build_cnn(input_shape=input_shape)
    # Save baseline model (random weights). Training will overwrite it.
    model.save(model_path)
    return model


def predict_from_audio_bytes(
    file_bytes: bytes,
    model_path: str,
    audio_cfg: AudioConfig,
    feat_cfg: FeatureConfig,
    model_cfg: ModelConfig,
) -> Tuple[str, float, Dict[str, float], Dict[str, object]]:
    """
    Returns:
      - predicted class label
      - confidence in percent
      - probabilities per class in percent
      - visualization payload (downsampled waveform + mel-spectrogram)
    """
    y, sr = preprocess_audio(file_bytes, audio_cfg)
    x, feats = extract_all_features(y, sr, feat_cfg)
    x_b = np.expand_dims(x, axis=0)  # (1, H, W, C)

    model = _ensure_model(model_path, input_shape=x.shape)
    probs = model.predict(x_b, verbose=0)[0].astype(np.float64)
    probs = probs / (probs.sum() + 1e-12)

    idx = int(np.argmax(probs))
    label = model_cfg.classes[idx]
    confidence = float(probs[idx] * 100.0)
    prob_map = {cls: float(p * 100.0) for cls, p in zip(model_cfg.classes, probs)}

    # Visualization payload (keep JSON light)
    waveform = y
    # downsample waveform to <= 2000 points
    n_w = min(2000, len(waveform))
    w_idx = np.linspace(0, len(waveform) - 1, num=n_w).astype(int)
    waveform_ds = waveform[w_idx].astype(np.float32)

    mel = feats["mel"]  # (n_mels, t)
    # downsample mel to 128x128-ish for client rendering
    h = min(128, mel.shape[0])
    w = min(128, mel.shape[1])
    mel_ds = mel[:h, :w].astype(np.float32)

    viz = {
        "sample_rate": int(sr),
        "waveform": waveform_ds.tolist(),
        "mel_spectrogram": mel_ds.tolist(),
    }
    return label, confidence, prob_map, viz

