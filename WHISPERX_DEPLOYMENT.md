# 🚀 WhisperX Backend Deployment Guide for Clarnote

This guide will help you deploy a high-performance WhisperX backend on Modal and connect it to your Clarnote frontend.

## ✨ Features

- ⚡ **4x faster** than standard Whisper
- 🎯 **Speaker diarization** (identifies different speakers)
- ⏰ **Word-level timestamps** 
- 🌍 **Multi-language support**
- 🔄 **Serverless scaling** (pay only when used)
- 🎪 **Easy deployment** with Modal

## 📋 Prerequisites

1. **Modal Account**: Create free account at [modal.com](https://modal.com)
2. **HuggingFace Account**: For speaker diarization models
3. **Clarnote App**: Your existing Next.js app

## 🛠 Step 1: Setup Modal

### Install Modal CLI
```bash
pip install modal
```

### Authenticate with Modal
```bash
modal setup
```

### Create HuggingFace Token (for speaker diarization)
1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Create a new token with **READ** permissions
3. Accept the pyannote terms: [pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1)

## 🚀 Step 2: Deploy WhisperX to Modal

### Upload the deployment script
The `modal_whisperx.py` file is already created in your project.

### Set environment variables in Modal
```bash
modal secret create huggingface-token HUGGINGFACE_TOKEN=your_hf_token_here
```

### Deploy the WhisperX app
```bash
modal deploy modal_whisperx.py
```

### Test the deployment
```bash
modal run modal_whisperx.py
```

Expected output:
```
🧪 Testing WhisperX deployment...
🎉 Test Results:
Success: True
Language: en
Duration: 6.0s
Text: The example audio transcription...
Segments: 12
```

## ⚙️ Step 3: Configure Clarnote Frontend

### Update your `.env.local` file:
```bash
# WhisperX Configuration
WHISPERX_ENDPOINT=https://your-app-name--clarnote-whisperx-api.modal.run
WHISPERX_API_KEY=optional_api_key_if_needed
```

### Find your Modal endpoint URL:
```bash
modal app list
modal app lookup clarnote-whisperx
```

## 🧪 Step 4: Test Integration

### Test from your Clarnote app:
1. Start your local server: `PORT=3001 npm run dev`
2. Go to `http://localhost:3001` 
3. Upload an audio file
4. Check the transcription results

### Expected API response:
```json
{
  "text": "Full transcription text...",
  "segments": [
    {
      "speaker": "speaker_0",
      "text": "Hello, this is speaker one.",
      "start": 0.0,
      "end": 2.5,
      "words": [...]
    }
  ],
  "language": "en",
  "duration": 45.2,
  "success": true,
  "model": "whisperx-large-v2",
  "features": {
    "word_timestamps": true,
    "speaker_diarization": true
  }
}
```

## 💰 Cost Optimization

### GPU Tiers (adjust in `modal_whisperx.py`):
- **A10G**: ~$0.60/hour (Modal free tier)
- **H100**: ~$4.00/hour (fastest, for production)

### Tips:
- Models are cached after first load
- `scaledown_window=300` keeps containers warm for 5 minutes
- Concurrent processing for multiple files

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Model not found" error
```bash
# Clear cache and redeploy
modal volume list
modal volume delete whisperx-cache
modal deploy modal_whisperx.py
```

#### 2. Speaker diarization disabled
- Ensure HuggingFace token is set correctly
- Accept pyannote model terms
- Check Modal logs: `modal logs clarnote-whisperx`

#### 3. Slow first transcription
- Normal! Models download on first use (~2-3 minutes)
- Subsequent calls are fast

#### 4. Out of memory errors
- Change GPU_CONFIG to "H100" in `modal_whisperx.py`
- Or reduce batch_size from 16 to 8

### Check Modal logs:
```bash
modal app logs clarnote-whisperx
```

## 🔧 Advanced Configuration

### Language Support
Modify the default language in `modal_whisperx.py`:
```python
# For Spanish meetings:
language_code = "es"  # in setup() method
```

### Performance Tuning
```python
# For faster processing (less accuracy):
compute_type = "int8"  # instead of "float16"

# For larger batch sizes (needs more GPU memory):
batch_size = 32  # instead of 16
```

### Custom Models
```python
# Use different Whisper model sizes:
self.model = whisperx.load_model("large-v3", ...)  # Most accurate
self.model = whisperx.load_model("medium", ...)    # Balanced
self.model = whisperx.load_model("base", ...)      # Fastest
```

## 📊 Performance Benchmarks

| Model | Speed | Accuracy | GPU Memory | Cost/Hour |
|-------|-------|----------|------------|-----------|
| base | 4x | Good | 4GB | $0.60 |
| medium | 3x | Better | 8GB | $0.60 |
| large-v2 | 2x | Best | 12GB | $4.00 |

## 🚀 Production Deployment

### Environment Variables for Production:
```bash
# In your production environment (Vercel, etc.)
WHISPERX_ENDPOINT=https://your-production-modal-endpoint.modal.run
WHISPERX_API_KEY=your_production_api_key
```

### Monitoring:
- Monitor usage in Modal dashboard
- Set up billing alerts
- Use Modal's built-in metrics

## 📞 Support

### Modal Support:
- [Modal Documentation](https://modal.com/docs)
- [Modal Discord](https://discord.gg/modal)

### WhisperX Issues:
- [WhisperX GitHub](https://github.com/m-bain/whisperx)

### Clarnote Integration:
- Check your console logs for API errors
- Verify environment variables are set
- Test with small audio files first

---

🎉 **You're all set!** Your Clarnote app now has professional-grade transcription with speaker detection! 