import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai'; 

export interface Flashcard {
  question: string;
  answer: string;
}

export async function generateFlashcards(text: string): Promise<Flashcard[] | null> {
  try {
    const { text: responseText } = await generateText({
      model: openai('gpt-4o'), 
      prompt: `Input Text:\n${text}\n\nReturn ONLY a JSON Array where each object has a question and answer key. Do not wrap it in markdown. Just the array.`,
    });

    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const flashcards: Flashcard[] = JSON.parse(cleanJsonString);
    
    return flashcards;
  } catch (error) {
    console.error("Error generating or parsing JSON from AI:", error);
    return null;
  }
}
