'use server';
/**
 * @fileOverview A GenAI assistant for generating SEO-friendly blog post ideas and draft content related to scrap metal and recycling.
 *
 * - generateBlogContent - A function that handles the generation of blog content.
 * - GenerateBlogContentInput - The input type for the generateBlogContent function.
 * - GenerateBlogContentOutput - The return type for the generateBlogContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const GenerateBlogContentInputSchema = z.object({
  keywords: z.array(z.string()).describe('A list of keywords related to scrap metal and recycling, to be used for generating blog content.'),
});
export type GenerateBlogContentInput = z.infer<typeof GenerateBlogContentInputSchema>;

// Output Schema
const BlogPostSchema = z.object({
  title: z.string().describe('An SEO-friendly blog post title related to scrap metal and recycling.'),
  slug: z.string().describe('A URL-friendly slug for the blog post, derived from the title (e.g., "how-to-recycle-metal").'),
  summary: z.string().describe('A brief, SEO-optimized summary or meta description for the blog post.'),
  draft: z.string().describe('The full draft content of the blog post, suitable for a recycling website, targeting an older demographic and emphasizing the importance and benefits of recycling.'),
});

const GenerateBlogContentOutputSchema = BlogPostSchema;
export type GenerateBlogContentOutput = z.infer<typeof GenerateBlogContentOutputSchema>;

// Prompt definition
const generateBlogContentPrompt = ai.definePrompt({
  name: 'generateBlogContentPrompt',
  input: {schema: GenerateBlogContentInputSchema},
  output: {schema: GenerateBlogContentOutputSchema},
  prompt: `You are a master SEO content strategist and writer for "Atık Rehber", a Turkish website specializing in scrap metal and recycling. Your primary mission is to create content that will rank #1 on Google for the most common search queries related to scrap dealing in Turkey.

Your response must be in the format of the JSON schema provided.

Users are often searching for terms like "güncel hurda fiyatları", "hurdacı telefonu", "en yakın hurdacı", "adresten hurda alanlar", "bakırın kilosu ne kadar", "demir hurdası fiyatı", and "alüminyum hurda".

Based on the provided core keywords, generate a single, high-quality, and SEO-optimized blog post. Your target audience is broad, including individuals and businesses in Turkey, so the language should be clear, authoritative, and trustworthy.

For the blog post, you must provide:
1.  **title**: A compelling, SEO-friendly title that targets a high-volume search query. (e.g., "Güncel Hurda Fiyatları 2024: Demir, Bakır, Alüminyum Fiyat Listesi").
2.  **slug**: A clean, URL-friendly slug based on the title.
3.  **summary**: A concise meta description (150-160 characters) that includes primary keywords and entices users to click from search results.
4.  **draft**: The full blog post content in HTML format. The content must be comprehensive, informative, and at least 400 words long. Use headings (<h2>, <h3>), paragraphs (<p>), and lists (<ul>, <li>) to structure the content for readability. Naturally weave in the provided keywords and related long-tail variations throughout the text.

Core Keywords: {{{keywords}}}`,
});

// Flow definition
const generateBlogContentFlow = ai.defineFlow(
  {
    name: 'generateBlogContentFlow',
    inputSchema: GenerateBlogContentInputSchema,
    outputSchema: GenerateBlogContentOutputSchema,
  },
  async (input) => {
    const {output} = await generateBlogContentPrompt(input);
    if (!output) {
      throw new Error('No output generated from the prompt.');
    }
    return output;
  }
);

// Wrapper function
export async function generateBlogContent(input: GenerateBlogContentInput): Promise<GenerateBlogContentOutput> {
  return generateBlogContentFlow(input);
}
