import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GEMINI_API_KEY,
});

export interface Flashcard {
  question: string;
  answer: string;
}

export async function generateFlashcards(text: string): Promise<Flashcard[] | null> {
  try {
    const { text: responseText } = await generateText({
      model: google('gemini-3.5-flash'), 
      prompt: `Input Text:\n${text}\n\nCreate flashcards from the input text following these examples of good and bad flashcards:

--- GOOD FLASHCARDS EXAMPLES ---
Q: What is the primary function of the CSS "will-change" property?
A: It hints to the browser how an element will change, allowing it to optimize animations ahead of time via the GPU.

Q: In SolidJS, what mechanism completely replaces the traditional virtual DOM?
A: Fine-grained reactivity, which updates specific DOM nodes directly when data changes.

Q: What is the main security risk of hardcoding an API key directly in a client-side JavaScript file?
A: The key becomes fully visible to anyone inspecting the website's source code in their browser.


--- BAD FLASHCARDS EXAMPLES ---
Q: Tell me everything about JavaScript.
A: JavaScript is a scripting language invented in 1995 by Brendan Eich, it runs inside browsers, can be used on the server via Node.js, uses prototypal inheritance, and is single-threaded.

Q: Is Tailwind CSS good?
A: Yes, it is very good because it makes writing utility classes easy and fast for styling modern responsive interfaces.

Q: How do you fix an error in a .env file and push it to Git safely?
A: First you add it to .gitignore, then you run git rm --cached .env to stop tracking it, then you commit the change, and then you have to cycle your API keys if you already pushed them online.

Return ONLY a JSON Array where each object has a "question" and "answer" key. Do not wrap it in markdown. Just the array.`,
    });

    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const flashcards: Flashcard[] = JSON.parse(cleanJsonString);
    
    return flashcards;
  } catch (error) {
    console.error("Error generating or parsing JSON from AI:", error);
    return null;
  }
}
