
'use server';
/**
 * @fileOverview A beauty look analyzer that suggests matching products with fallback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchingProductsInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a beauty look, as a data URI."),
});
export type MatchingProductsInput = z.infer<typeof MatchingProductsInputSchema>;

const MatchingProductsOutputSchema = z.object({
  bundleDescription: z.string().describe("A brief description of why these products match the look."),
  recommendedProductIds: z.array(z.string()).describe("List of product IDs (prod1, prod2, prod3, prod4)."),
});
export type MatchingProductsOutput = z.infer<typeof MatchingProductsOutputSchema>;

/**
 * Analyzes an image for products. Includes a fallback if the AI service fails.
 */
export async function getMatchingProducts(input: MatchingProductsInput): Promise<MatchingProductsOutput> {
  try {
    return await matchingProductsFlow(input);
  } catch (error) {
    // Fallback data if API key is missing or service is down
    return {
      bundleDescription: "We've picked our most popular professional items that work for almost any premium look.",
      recommendedProductIds: ['prod1', 'prod2', 'prod4']
    };
  }
}

const prompt = ai.definePrompt({
  name: 'matchingProductsPrompt',
  input: {schema: MatchingProductsInputSchema},
  output: {schema: MatchingProductsOutputSchema},
  prompt: `You are an expert celebrity beauty stylist. 

Analyze this inspiration photo and suggest a matching bundle from our collection.

Our Catalog:
- prod1: Silk Radiance Foundation (smooth, glowing base)
- prod2: Velvet Matte Lip Ink (bold, long-lasting lips)
- prod3: Gold Infused Face Oil (natural luminosity)
- prod4: Illuminating Priming Veil (prep for professional results)

Photo: {{media url=photoDataUri}}

Provide a stylistic reason for your choices. Select up to 3 most relevant product IDs.`,
});

const matchingProductsFlow = ai.defineFlow(
  {
    name: 'matchingProductsFlow',
    inputSchema: MatchingProductsInputSchema,
    outputSchema: MatchingProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
