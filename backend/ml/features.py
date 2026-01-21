from __future__ import annotations

from typing import Dict, Tuple

import librosa
import numpy as np

from .config import FeatureConfig


def _to_db(x: np.ndarray) -> np.ndarray:
    return librosa.power_to_db(x, ref=np.max).astype(np.float32)


def extract_mel_spectrogram(y: np.ndarray, sr: int, cfg: FeatureConfig) -> np.ndarray:
    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_fft=cfg.n_fft,
        hop_length=cfg.hop_length,
        n_mels=cfg.n_mels,
        fmin=cfg.fmin,
        fmax=cfg.fmax,
        power=2.0,
    )
    mel_db = _to_db(mel)
    return mel_db


def extract_mfcc(y: np.ndarray, sr: int, cfg: FeatureConfig) -> np.ndarray:
    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=cfg.n_mfcc,
        n_fft=cfg.n_fft,
        hop_length=cfg.hop_length,
        n_mels=cfg.n_mels,
        fmin=cfg.fmin,
        fmax=cfg.fmax,
    )
    return mfcc.astype(np.float32)


def standardize_feature(feat: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    mu = np.mean(feat)
    sd = np.std(feat)
    if sd < eps:
        return (feat - mu).astype(np.float32)
    return ((feat - mu) / sd).astype(np.float32)


def features_to_cnn_input(mel: np.ndarray, mfcc: np.ndarray) -> np.ndarray:
    """
    Convert (freq x time) features into CNN input: (H, W, C) float32
    We align time dimension by trimming/padding to min time length.
    Channels: [mel, mfcc_resized]
    """
    # Align time length
    t = min(mel.shape[1], mfcc.shape[1])
    mel_a = mel[:, :t]
    mfcc_a = mfcc[:, :t]

    # Resize MFCC "freq" axis to match mel bins for stacking
    mfcc_resized = librosa.util.fix_length(mfcc_a, size=mel_a.shape[0], axis=0)

    mel_s = standardize_feature(mel_a)
    mfcc_s = standardize_feature(mfcc_resized)

    x = np.stack([mel_s, mfcc_s], axis=-1)  # (H, W, 2)
    return x.astype(np.float32)


def extract_all_features(y: np.ndarray, sr: int, cfg: FeatureConfig) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
    mel = extract_mel_spectrogram(y, sr, cfg)
    mfcc = extract_mfcc(y, sr, cfg)
    x = features_to_cnn_input(mel, mfcc)
    return x, {"mel": mel, "mfcc": mfcc}

