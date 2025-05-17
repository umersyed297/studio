'use server';
/**
 * @fileOverview Implements a Genkit flow for answering biodiversity-related questions.
 *
 * - askBiodiversityQuestion - The main function to call the flow.
 * - BiodiversityQnAInput - Input schema for the flow.
 * - BiodiversityQnAOutput - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BiodiversityQnAInputSchema = z.object({
  question: z.string().describe("The user's question about biodiversity."),
});
export type BiodiversityQnAInput = z.infer<typeof BiodiversityQnAInputSchema>;

const BiodiversityQnAOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the biodiversity question."),
});
export type BiodiversityQnAOutput = z.infer<typeof BiodiversityQnAOutputSchema>;

export async function askBiodiversityQuestion(input: BiodiversityQnAInput): Promise<BiodiversityQnAOutput> {
  return biodiversityQnAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'biodiversityQnAPrompt',
  input: {schema: BiodiversityQnAInputSchema},
  output: {schema: BiodiversityQnAOutputSchema},
  prompt: `You are a helpful AI assistant specializing in biodiversity, particularly in Islamabad, Pakistan, and its surrounding regions.
Your primary goal is to provide accurate and informative answers to questions about local flora, fauna, ecosystems, conservation efforts, and general biodiversity topics.

If the user's question is NOT related to biodiversity, nature, wildlife, plants, animals, ecosystems, or conservation, you MUST politely decline to answer. For example, you can say: "I can only answer questions related to biodiversity. Please ask me something about nature, wildlife, or conservation."

User's question: {{{question}}}

Provide your answer based on this question.
`,
});

const biodiversityQnAFlow = ai.defineFlow(
  {
    name: 'biodiversityQnAFlow',
    inputSchema: BiodiversityQnAInputSchema,
    outputSchema: BiodiversityQnAOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // This case might happen if the model fails to generate or if there's an issue with the prompt execution.
      // It can also occur if the model returns an empty output that doesn't match the schema.
      return { answer: "I encountered an issue generating a response or the question might be off-topic according to my guidelines. Please try rephrasing or ask another biodiversity-related question." };
    }
    return output;
  }
);
