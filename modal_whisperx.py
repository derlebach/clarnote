import modal

# WhisperX deployment for Clarnote
# Enhanced version with speaker diarization and API endpoint

cuda_version = "12.4.0"
flavor = "devel"
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"

# Create Modal image with WhisperX and dependencies
image = (
    modal.Image.from_registry(f"nvidia/cuda:{tag}", add_python="3.11")
    .apt_install(
        "git",
        "ffmpeg",
    )
    .pip_install(
        "torch==2.0.0",
        "torchaudio==2.0.0",
        "numpy<2.0",
        index_url="https://download.pytorch.org/whl/cu118",
    )
    .pip_install(
        "git+https://github.com/m-bain/whisperx.git@v3.2.0",
        "ffmpeg-python",
        "ctranslate2==4.4.0",
        "fastapi",
        "python-multipart",
    )
)

app = modal.App("clarnote-whisperx", image=image)

# GPU configuration - using H100 for best performance
GPU_CONFIG = "H100"  # Use "A10G" for free tier

# Cache directory for models
CACHE_DIR = "/cache"
cache_vol = modal.Volume.from_name("whisperx-cache", create_if_missing=True)

@app.cls(
    gpu=GPU_CONFIG,
    volumes={CACHE_DIR: cache_vol},
    scaledown_window=60 * 5,  # Keep warm for 5 minutes
    timeout=60 * 30,  # 30 minute timeout for long files
    allow_concurrent_inputs=10,  # Handle multiple requests
)
class WhisperXModel:
    @modal.enter()
    def setup(self):
        """Initialize WhisperX model and speaker diarization"""
        import whisperx
        import os
        
        print("🚀 Loading WhisperX model...")
        
        self.device = "cuda"
        self.compute_type = "float16"  # Use "int8" if low on GPU mem
        self.batch_size = 16
        
        # Load Whisper model
        self.model = whisperx.load_model(
            "large-v2", 
            self.device, 
            compute_type=self.compute_type, 
            download_root=CACHE_DIR
        )
        
        # Load alignment model (for word-level timestamps)
        self.align_model, self.align_metadata = whisperx.load_align_model(
            language_code="en",  # Default to English, can be dynamic
            device=self.device,
            model_dir=CACHE_DIR
        )
        
        # Load diarization model (for speaker detection)
        # Note: You'll need HuggingFace token for pyannote models
        try:
            self.diarize_model = whisperx.DiarizationPipeline(
                use_auth_token=os.environ.get("HUGGINGFACE_TOKEN"),
                device=self.device,
                model_dir=CACHE_DIR
            )
            self.diarization_enabled = True
            print("✅ Speaker diarization enabled")
        except Exception as e:
            print(f"⚠️ Speaker diarization disabled: {e}")
            self.diarization_enabled = False
        
        print("✅ WhisperX model loaded successfully!")

    @modal.method()
    def transcribe(self, audio_data: bytes, language: str = "auto", task: str = "transcribe"):
        """
        Transcribe audio with WhisperX
        
        Args:
            audio_data: Raw audio file bytes
            language: Language code ("en", "es", "fr", etc.) or "auto"
            task: "transcribe" or "translate"
        
        Returns:
            dict: Transcription results with text, segments, and metadata
        """
        import whisperx
        import tempfile
        import os
        
        print(f"🎯 Starting transcription (language: {language}, task: {task})")
        
        try:
            # Save audio bytes to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_data)
                temp_path = temp_file.name
            
            # Load audio
            audio = whisperx.load_audio(temp_path)
            
            # Step 1: Transcribe with Whisper
            result = self.model.transcribe(
                audio, 
                batch_size=self.batch_size,
                language=None if language == "auto" else language
            )
            
            detected_language = result.get("language", "en")
            print(f"🗣️ Detected language: {detected_language}")
            
            # Step 2: Align whisper output (word-level timestamps)
            try:
                # Load alignment model for detected language
                align_model, align_metadata = whisperx.load_align_model(
                    language_code=detected_language,
                    device=self.device,
                    model_dir=CACHE_DIR
                )
                
                result = whisperx.align(
                    result["segments"], 
                    align_model, 
                    align_metadata, 
                    audio, 
                    self.device, 
                    return_char_alignments=False
                )
                print("✅ Word-level alignment completed")
            except Exception as e:
                print(f"⚠️ Alignment failed: {e}")
            
            # Step 3: Speaker diarization (if enabled)
            if self.diarization_enabled:
                try:
                    diarize_segments = self.diarize_model(audio)
                    result = whisperx.assign_word_speakers(diarize_segments, result)
                    print("✅ Speaker diarization completed")
                except Exception as e:
                    print(f"⚠️ Diarization failed: {e}")
            
            # Cleanup
            os.unlink(temp_path)
            
            # Process results
            segments = result.get("segments", [])
            full_text = " ".join([seg.get("text", "") for seg in segments])
            
            # Extract speaker segments for frontend
            speaker_segments = []
            for seg in segments:
                speaker_segments.append({
                    "speaker": seg.get("speaker", "Unknown"),
                    "text": seg.get("text", ""),
                    "start": seg.get("start", 0),
                    "end": seg.get("end", 0),
                    "words": seg.get("words", [])
                })
            
            # Calculate duration
            duration = max([seg.get("end", 0) for seg in segments]) if segments else 0
            
            return {
                "text": full_text.strip(),
                "segments": speaker_segments,
                "language": detected_language,
                "duration": duration,
                "success": True,
                "model": "whisperx-large-v2",
                "features": {
                    "word_timestamps": True,
                    "speaker_diarization": self.diarization_enabled
                }
            }
            
        except Exception as e:
            print(f"❌ Transcription error: {e}")
            return {
                "text": "",
                "segments": [],
                "language": "unknown",
                "duration": 0,
                "success": False,
                "error": str(e)
            }

# Create FastAPI web endpoint
@app.function(
    image=image,
    allow_concurrent_inputs=50,
)
@modal.web_endpoint(method="POST", label="clarnote-whisperx-api")
def transcribe_endpoint(request_data: dict):
    """
    FastAPI endpoint for WhisperX transcription
    Expected input: multipart/form-data with 'file' field
    """
    import base64
    
    try:
        # Handle file upload
        if "file" not in request_data:
            return {"error": "No file provided", "success": False}
        
        # Decode base64 file data
        file_data = request_data["file"]
        if isinstance(file_data, str):
            audio_bytes = base64.b64decode(file_data)
        else:
            audio_bytes = file_data
        
        # Get optional parameters
        language = request_data.get("language", "auto")
        task = request_data.get("task", "transcribe")
        
        # Run transcription
        model = WhisperXModel()
        result = model.transcribe.remote(audio_bytes, language, task)
        
        return result
        
    except Exception as e:
        return {
            "error": f"Endpoint error: {str(e)}",
            "success": False
        }

# Local test function
@app.local_entrypoint()
def test_transcription():
    """Test the WhisperX deployment locally"""
    import requests
    
    # Test with a sample audio URL
    test_url = "https://pub-ebe9e51393584bf5b5bea84a67b343c2.r2.dev/examples_english_english.wav"
    
    print("🧪 Testing WhisperX deployment...")
    
    # Download test audio
    response = requests.get(test_url)
    audio_data = response.content
    
    # Test transcription
    model = WhisperXModel()
    result = model.transcribe.remote(audio_data, language="en")
    
    print("🎉 Test Results:")
    print(f"Success: {result['success']}")
    print(f"Language: {result['language']}")
    print(f"Duration: {result['duration']}s")
    print(f"Text: {result['text'][:100]}...")
    print(f"Segments: {len(result['segments'])}")
    
    return result 