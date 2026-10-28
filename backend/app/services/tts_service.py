import os
import tempfile
import requests
from app.config import settings

# Hugging Face TTS fallback endpoint
TTS_API_URL = "https://router.huggingface.co/hf-inference/models/espnet/kan-bayashi_ljspeech_vits"
_HF_FAILED = False

def synthesize_with_pyttsx3(text: str) -> bytes | None:
    """Synthesize speech locally using pyttsx3 (SAPI5 on Windows) with COM thread initialization."""
    try:
        try:
            import pythoncom
            pythoncom.CoInitialize()
        except Exception:
            pass

        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty("rate", 160)
        
        # Select natural voice if available
        voices = engine.getProperty("voices")
        if voices:
            for v in voices:
                if "zira" in v.name.lower() or "eva" in v.name.lower():
                    engine.setProperty("voice", v.id)
                    break

        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"tts_{os.getpid()}_{hash(text) & 0xffffffff}.wav")

        engine.save_to_file(text, temp_path)
        engine.runAndWait()

        if os.path.exists(temp_path):
            with open(temp_path, "rb") as f:
                data = f.read()
            try:
                os.remove(temp_path)
            except Exception:
                pass
            return data
    except Exception as e:
        print(f"pyttsx3 synthesis error: {e}")
    finally:
        try:
            import pythoncom
            pythoncom.CoUninitialize()
        except Exception:
            pass
    return None

def synthesize_speech(text: str) -> bytes | None:
    """Generate audio speech bytes using Hugging Face TTS with fast local fallback."""
    global _HF_FAILED

    # 1. Attempt Hugging Face only if not previously failed
    if settings.HF_TOKEN and not _HF_FAILED:
        try:
            headers = {"Authorization": f"Bearer {settings.HF_TOKEN}"}
            response = requests.post(
                TTS_API_URL,
                headers=headers,
                json={"inputs": text},
                timeout=3
            )
            if response.status_code == 200 and len(response.content) > 1000:
                return response.content
            else:
                _HF_FAILED = True
        except Exception as e:
            _HF_FAILED = True
            print(f"HF TTS unreachable ({e}); permanently switching to ultra-fast local speech synthesis.")

    # 2. Local speech synthesis via pyttsx3 (immediate, zero latency, guaranteed to work)
    local_audio = synthesize_with_pyttsx3(text)
    if local_audio:
        return local_audio

    return None