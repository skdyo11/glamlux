import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Ensure environment variables are loaded before Genkit initializes
import 'dotenv/config';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
