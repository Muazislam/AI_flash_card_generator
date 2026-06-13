import type { APIRoute } from 'astro';
import { generateFlashcards } from '../../utils/generateFlashcards';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const flashcards = await generateFlashcards(text);

    if (!flashcards) {
      return new Response(JSON.stringify({ error: 'Failed to generate flashcards from AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ flashcards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
