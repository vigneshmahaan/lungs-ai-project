from __future__ import annotations

import io
from typing import Tuple

import librosa
import numpy as np

from .config import AudioConfig


def load_audio(file_bytes: bytes, cfg: AudioConfig) -> Tuple[np.ndarray, int]:
    """
    Load audio bytes (wav/mp3/...) into mono float32 waveform at native sr.
    Librosa uses soundfile/audioread under the hood depending on format.
    """
    bio = io.BytesIO(file_bytes)
    y, sr = librosa.load(bio, sr=None, mono=True)
    if y is None or len(y) == 0:
        raise ValueError("Empty/invalid audio.")
    return y.astype(np.float32), int(sr)


def resample(y: np.ndarray, sr: int, cfg: AudioConfig) -> Tuple[np.ndarray, int]:
    if sr == cfg.target_sr:
        return y, sr
    y_rs = librosa.resample(y, orig_sr=sr, target_sr=cfg.target_sr)
    return y_rs.astype(np.float32), cfg.target_sr


def reduce_noise(y: np.ndarray) -> np.ndarray:
    """
    Lightweight noise reduction via spectral gating:
    - compute STFT magnitude
    - estimate noise floor from lower percentile
    - attenuate below a threshold
    This is deterministic and avoids extra deps (e.g., noisereduce).
    """
    if y.size < 1024:
        return y
    stft = librosa.stft(y, n_fft=1024, hop_length=256)
    mag, phase = np.abs(stft), np.exp(1j * np.angle(stft))
    noise_floor = np.percentile(mag, 10, axis=1, keepdims=True)
    mask = mag >= (noise_floor * 1.5)
    mag_d = mag * mask
    y_d = librosa.istft(mag_d * phase, hop_length=256, length=len(y))
    return y_d.astype(np.float32)


def normalize(y: np.ndarray, eps: float = 1e-8) -> np.ndarray:
    y = y - np.mean(y)
    mx = np.max(np.abs(y))
    if mx < eps:
        return y.astype(np.float32)
    return (y / mx).astype(np.float32)


def pad_or_trim(y: np.ndarray, sr: int, cfg: AudioConfig) -> np.ndarray:
    target_len = int(cfg.duration_seconds * sr)
    if len(y) == target_len:
        return y.astype(np.float32)
    if len(y) > target_len:
        return y[:target_len].astype(np.float32)
    out = np.zeros(target_len, dtype=np.float32)
    out[: len(y)] = y
    return out


def preprocess_audio(file_bytes: bytes, cfg: AudioConfig) -> Tuple[np.ndarray, int]:
    y, sr = load_audio(file_bytes, cfg)
    y, sr = resample(y, sr, cfg)
    y = reduce_noise(y)
    y = normalize(y)
    y = pad_or_trim(y, sr, cfg)
    return y, sr

