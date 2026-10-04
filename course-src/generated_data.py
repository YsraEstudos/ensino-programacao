from pathlib import Path

GENERATED_DIR = Path(__file__).resolve().parent / ".generated"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)
