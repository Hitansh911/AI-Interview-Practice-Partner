from fastapi import APIRouter, Response, HTTPException
from app.models.schemas import TTSRequest
from app.services.tts_service import synthesize_speech

router = APIRouter(prefix="/voice", tags=["Voice"])

@router.post("/tts")
async def text_to_speech(payload: TTSRequest):
    audio_bytes = synthesize_speech(payload.text)
    if not audio_bytes:
        raise HTTPException(status_code=503, detail="TTS service unavailable or HF_TOKEN not configured.")
    return Response(content=audio_bytes, media_type="audio/wav")

@router.post("/stt")
async def speech_to_text():
    return {"message": "STT endpoint ready for audio stream processing"}