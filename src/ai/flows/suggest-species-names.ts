'use server';
/**
 * @fileOverview Implements the SuggestSpeciesNames flow, suggesting species names based on an image.
 *
 * - suggestSpeciesNames - A function that suggests species names based on an image.
 * - SuggestSpeciesNamesInput - The input type for the suggestSpeciesNames function.
 * - SuggestSpeciesNamesOutput - The return type for the suggestSpeciesNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSpeciesNamesInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a species, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestSpeciesNamesInput = z.infer<typeof SuggestSpeciesNamesInputSchema>;

const SuggestSpeciesNamesOutputSchema = z.object({
  speciesNames: z.array(z.string()).describe('An array of suggested species names.'),
});
export type SuggestSpeciesNamesOutput = z.infer<typeof SuggestSpeciesNamesOutputSchema>;

export async function suggestSpeciesNames(input: SuggestSpeciesNamesInput): Promise<SuggestSpeciesNamesOutput> {
  return suggestSpeciesNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSpeciesNamesPrompt',
  input: {schema: SuggestSpeciesNamesInputSchema},
  output: {schema: SuggestSpeciesNamesOutputSchema},
  prompt: `You are an AI assistant specializing in identifying species from images.
  Given the following image, suggest 2-3 possible species names. Return the names in an array.
  If you are not confident in any possible suggestions, return an empty array and do not provide any other output.

  Image: {{media url=imageDataUri}}`,
});

const suggestSpeciesNamesFlow = ai.defineFlow(
  {
    name: 'suggestSpeciesNamesFlow',
    inputSchema: SuggestSpeciesNamesInputSchema,
    outputSchema: SuggestSpeciesNamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
