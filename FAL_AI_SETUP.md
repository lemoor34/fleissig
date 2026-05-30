# fal.ai Integration Setup

## Overview

This project integrates with [fal.ai](https://fal.ai/) - a platform for running AI models in the cloud.

## Setup Instructions

### 1. Get Your API Key

1. Go to https://fal.ai/
2. Sign in with GitHub (already done)
3. Navigate to Settings → API Keys
4. Copy your API key

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API key to `.env.local`:
   ```
   FAL_AI_API_KEY=02a8065b-07d6-4770-a62c-5cc31f3a5593:c54dbe1b7da29a01e65ca6133f3abc50
   ```

3. **Important:** Never commit `.env.local` to version control (it's already in `.gitignore`)

### 3. Usage

Import and use the client in your code:

```typescript
import { callFalAiModel } from '@/lib/fal-ai-client';

// Example: Generate an image
const response = await callFalAiModel('fast-flux', {
  prompt: 'A beautiful sunset over the ocean',
  image_size: 'landscape_16_9',
});

console.log(response);
```

## Available Models

- `fast-flux` - Fast image generation
- `stable-diffusion` - Stable Diffusion model
- `lora` - LoRA model fine-tuning
- And more at https://fal.ai/docs

## Documentation

- [fal.ai API Documentation](https://fal.ai/docs)
- [API Reference](https://fal.ai/docs/reference)
- [Models & Pricing](https://fal.ai/models)

## Troubleshooting

- **"FAL_AI_API_KEY is not set"**: Make sure `.env.local` is created and has the correct API key
- **Authentication errors**: Check that your API key is valid and not expired
- **Rate limiting**: Check fal.ai's rate limits for your plan

## Security

- Never share your API key
- Keep `.env.local` in `.gitignore`
- Use environment-specific keys for different environments (dev, staging, production)
