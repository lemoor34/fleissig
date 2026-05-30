/**
 * fal.ai Client Configuration
 * API Documentation: https://fal.ai/docs
 */

const FAL_AI_API_KEY = process.env.FAL_AI_API_KEY;

if (!FAL_AI_API_KEY) {
  throw new Error('FAL_AI_API_KEY is not set in environment variables');
}

// Initialize fal.ai client
export const initFalAiClient = () => {
  return {
    apiKey: FAL_AI_API_KEY,
    baseUrl: 'https://api.fal.ai',
  };
};

/**
 * Example function to call fal.ai API
 * @param model - Model name (e.g., 'fast-flux', 'stable-diffusion')
 * @param input - Input parameters for the model
 */
export const callFalAiModel = async (
  model: string,
  input: Record<string, any>
) => {
  const client = initFalAiClient();

  try {
    const response = await fetch(`${client.baseUrl}/fal-ai/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${client.apiKey}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`fal.ai API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling fal.ai API:', error);
    throw error;
  }
};

export default {
  initFalAiClient,
  callFalAiModel,
};
