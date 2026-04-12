'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending products that complement a specific parlour deal.
 *
 * - productRecommendationForDeal - A function that handles the product recommendation process.
 * - ProductRecommendationForDealInput - The input type for the productRecommendationForDeal function.
 * - ProductRecommendationForDealOutput - The return type for the productRecommendationForDeal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationForDealInputSchema = z.object({
  dealName: z.string().describe('The name of the parlour deal.'),
  dealCategory: z.enum(['Bridal', 'Hair', 'Skin']).describe('The category of the parlour deal (e.g., Bridal, Hair, Skin).'),
  upsellProductId: z.string().optional().describe('An optional ID of a specific product to upsell with this deal.'),
});
export type ProductRecommendationForDealInput = z.infer<typeof ProductRecommendationForDealInputSchema>;

const ProductRecommendationForDealOutputSchema = z.object({
  recommendedProducts: z.array(z.string()).describe('A list of product names recommended to complement the deal.'),
});
export type ProductRecommendationForDealOutput = z.infer<typeof ProductRecommendationForDealOutputSchema>;

export async function productRecommendationForDeal(input: ProductRecommendationForDealInput): Promise<ProductRecommendationForDealOutput> {
  return productRecommendationForDealFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationForDealPrompt',
  input: {schema: ProductRecommendationForDealInputSchema},
  output: {schema: ProductRecommendationForDealOutputSchema},
  prompt: `You are an expert beauty consultant specializing in product recommendations for beauty parlour deals. Your task is to recommend products that complement a specific parlour deal.
Consider the deal's name and category, and if an upsellProductId is provided, prioritize recommending products related to that ID, while also suggesting other relevant items.

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
