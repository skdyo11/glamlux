
'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending products that complement a specific parlour deal.
 *
 * - productRecommendationForDeal - A function that handles the product recommendation process with fallback.
 * - ProductRecommendationForDealInput - The input type for the productRecommendationForDeal function.
 * - ProductRecommendationForDealOutput - The return type for the productRecommendationForDeal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationForDealInputSchema = z.object({
  dealName: z.string().describe('The name of the parlour deal.'),
  dealCategory: z.enum(['Bridal', 'Hair', 'Skin']).describe('The category of the parlour deal.'),
  upsellProductId: z.string().optional().describe('An optional ID of a specific product to upsell.'),
});
export type ProductRecommendationForDealInput = z.infer<typeof ProductRecommendationForDealInputSchema>;

const ProductRecommendationForDealOutputSchema = z.object({
  recommendedProducts: z.array(z.string()).describe('A list of product names recommended to complement the deal.'),
});
export type ProductRecommendationForDealOutput = z.infer<typeof ProductRecommendationForDealOutputSchema>;

/**
 * Recommends products for a deal. Includes a fallback if the AI service fails.
 */
export async function productRecommendationForDeal(input: ProductRecommendationForDealInput): Promise<ProductRecommendationForDealOutput> {
  try {
    return await productRecommendationForDealFlow(input);
  } catch (error) {
    // Fallback data if API key is missing or service is down
    const fallbacks: Record<string, string[]> = {
      'Bridal': ['Silk Radiance Foundation', 'Velvet Matte Lip Ink', 'Illuminating Priming Veil'],
      'Hair': ['Gold Infused Face Oil', 'Silk Therapy Shampoo', 'Shine Spray'],
      'Skin': ['Gold Infused Face Oil', 'Hydrating Cream', 'Sunscreen Veil']
    };
    return { 
      recommendedProducts: fallbacks[input.dealCategory] || ['Best Selling Foundation', 'Popular Lipstick'] 
    };
  }
}

const prompt = ai.definePrompt({
  name: 'productRecommendationForDealPrompt',
  input: {schema: ProductRecommendationForDealInputSchema},
  output: {schema: ProductRecommendationForDealOutputSchema},
  prompt: `You are an expert beauty consultant. Recommend products that complement this deal.
Keep it simple.

Deal Name: {{{dealName}}}
Deal Category: {{{dealCategory}}}
{{#if upsellProductId}}
Specific Upsell Product ID: {{{upsellProductId}}}
{{/if}}

Provide a list of up to 5 product names that would best complement this deal.`,
});

const productRecommendationForDealFlow = ai.defineFlow(
  {
    name: 'productRecommendationForDealFlow',
    inputSchema: ProductRecommendationForDealInputSchema,
    outputSchema: ProductRecommendationForDealOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
