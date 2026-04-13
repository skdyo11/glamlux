
'use server';
/**
 * @fileOverview A beauty inspiration analyzer that suggests matching products.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchingProductsInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a beauty look, as a data URI that must include a MIME type and use Base64 encoding."),
});
export type MatchingProductsInput = z.infer<typeof MatchingProductsInputSchema>;

const MatchingProductsOutputSchema = z.object({
  bundleDescription: z.string().describe("A brief description of why these products match the look."),
  recommendedProductIds: z.array(z.string()).describe("List of product IDs from the catalog (e.g., prod1, prod2, prod3, prod4)."),
});
export type MatchingProductsOutput = z.infer<typeof MatchingProductsOutputSchema>;

export async function getMatchingProducts(input: MatchingProductsInput): Promise<MatchingProductsOutput> {
  return matchingProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchingProductsPrompt',
  input: {schema: MatchingProductsInputSchema},
  output: {schema: MatchingProductsOutputSchema},
  prompt: `You are an expert celebrity beauty stylist. 

Analyze this inspiration photo and suggest a matching "GlamLux Bundle" from our exclusive e-commerce collection.

Our Catalog:
- prod1: Silk Radiance Foundation (for that seamless, glowing base)
- prod2: Velvet Matte Lip Ink (for bold, long-lasting statement lips)
- prod3: Gold Infused Face Oil (to maintain the skin's natural luminosity)
- prod4: Illuminating Priming Veil (to prep the skin for professional results)

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
