from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class AudioConfig:
    target_sr: int = 16000
    duration_seconds: float = 6.0  # pad/trim to fixed length for CNN stability
    top_db: int = 30  # used by librosa effects (optional)


@dataclass(frozen=True)
class FeatureConfig:
    n_mels: int = 128
    n_mfcc: int = 40
    n_fft: int = 1024
    hop_length: int = 256
    fmin: int = 20
    fmax: int = 8000


@dataclass(frozen=True)
class ModelConfig:
    classes: List[str] = (
        "Normal",
        "Asthma",
        "Pneumonia",
        "Bronchitis",
        "COPD",
    )
    input_channels: int = 2  # [mel, mfcc] stacked

