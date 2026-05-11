'use server';
/**
 * @fileOverview This file defines a Genkit flow for the GlamLux AI Assistant.
 * It provides conversational guidance to users about parlours, deals, and products.
 *
 * - glamAssistant - The main function to call the assistant flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GlamAssistantInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    text: z.string(),
  })).describe('The conversation history.'),
  message: z.string().describe('The user\'s current message.'),
});
export type GlamAssistantInput = z.infer<typeof GlamAssistantInputSchema>;

const GlamAssistantOutputSchema = z.object({
  response: z.string().describe('The AI response text.'),
});
export type GlamAssistantOutput = z.infer<typeof GlamAssistantOutputSchema>;

/**
 * Calls the AI assistant flow to get a refined editorial response.
 */
export async function glamAssistant(input: GlamAssistantInput): Promise<GlamAssistantOutput> {
  try {
    return await glamAssistantFlow(input);
  } catch (error) {
    console.error('AI Assistant Flow Error:', error);
    return {
      response: "I apologize, but my connection to the registry is currently limited. Please explore our featured Parlours or Boutique in the meantime."
    };
  }
}

const prompt = ai.definePrompt({
  name: 'glamAssistantPrompt',
  input: {schema: GlamAssistantInputSchema},
  output: {schema: GlamAssistantOutputSchema},
  prompt: `You are the GlamLux AI Editorial Assistant. 
You are a sophisticated, helpful, and concise beauty consultant for the GlamLux marketplace.

Marketplace Registry:
- Parlours: Elite beauty sanctuaries in Gulberg, South Delhi, and DHA Karachi.
- Deals: Signature transformations like "Royal Bridal Glow Up" or "Silk Therapy Hair Spa".
- Shop: Professional artistry essentials from "GlamLux Couture".

Conversation History:
{{#each history}}
{{role}}: {{text}}
{{/each}}

New Inquiry: {{message}}

Goal: Provide a refined, luxury-native response. 
- Direct users to "Deals" for bookings/makeovers.
- Direct users to "Parlours" for finding a studio location.
- Direct users to "Shop" for makeup products.
Keep your response elegant and under 3 sentences.`,
});

const glamAssistantFlow = ai.defineFlow(
  {
    name: 'glamAssistantFlow',
    inputSchema: GlamAssistantInputSchema,
    outputSchema: GlamAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
