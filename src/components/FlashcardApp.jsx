import { createSignal, For, Show } from 'solid-js';

// Pure, highly-optimized JavaScript parsing function
function parseFlashcards(rawText) {
  if (!rawText.trim()) return [];

  // Matches either "Q: front A: back" or "front : back" variations globally
  const regex = /(?:Q:)?\s*(.*?)\s*(?::|A:)\s*(.*)/gi;
  const cards = [];
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    if (match[1] && match[2]) {
      cards.push({
        id: Math.random().toString(36).substring(2, 9),
        front: match[1].trim(),
        back: match[2].trim()
      });
    }
  }
  return cards;
}

export default function FlashcardApp() {
  const [text, setText] = createSignal('');
  const [cards, setCards] = createSignal([]);
  const [flippedCards, setFlippedCards] = createSignal(new Set());
  const [exitedCards, setExitedCards] = createSignal(new Map());

  const handleInput = (e) => {
    const value = e.target.value;
    setText(value);
    setCards(parseFlashcards(value));
    setFlippedCards(new Set());
    setExitedCards(new Map());
  };

  const toggleFlip = (id) => {
    const next = new Set(flippedCards());
    next.has(id) ? next.delete(id) : next.add(id);
    setFlippedCards(next);
  };

  const markCard = (id, direction, e) => {
    e.stopPropagation();
    const next = new Map(exitedCards());
    next.set(id, direction);
    setExitedCards(next);
  };

  return (
    <div class="p-6 max-w-5xl mx-auto font-sans">
      <div class="text-center mb-12 mt-8">
        <h1 class="text-4xl font-bold text-primary mb-3 tracking-tight">Instant Flashcards</h1>
        <p class="text-text-muted text-lg">Fast, optimized memory reinforcement.</p>
      </div>
      
      <div class="bg-card p-2 rounded-2xl shadow-sm border border-slate-100 mb-12">
        <textarea
          class="w-full h-40 p-4 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none resize-y text-text-base placeholder-text-muted transition-all duration-200 bg-transparent"
          placeholder="Paste text here. Example:&#10;Q: What is HTML? A: HyperText Markup Language&#10;CSS : Cascading Style Sheets"
          value={text()}
          onInput={handleInput}
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
        <For each={cards()}>
          {(card) => {
            const isFlipped = () => flippedCards().has(card.id);
            const exitState = () => exitedCards().get(card.id);

            const [hidden, setHidden] = createSignal(false);
            
            // To animate then remove, we apply classes based on exitState, and after 500ms set hidden
            if (exitState()) {
              setTimeout(() => setHidden(true), 450);
            }

            return (
              <Show when={!hidden()}>
                <div class="flex flex-col items-center group relative">
                  <div 
                    class={`w-full h-56 perspective-1000 cursor-pointer duration-500 ease-out transition-transform ${
                      exitState() === 'left' ? 'slide-out-left' : exitState() === 'right' ? 'slide-out-right' : ''
                    }`}
                    onClick={() => toggleFlip(card.id)}
                  >
                    <div 
                      class={`relative w-full h-full duration-500 ease-out preserve-3d will-change-transform shadow-sm group-hover:shadow-md rounded-2xl ${
                        isFlipped() ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front Side */}
                      <div class="absolute inset-0 bg-card border border-slate-200 rounded-2xl p-6 flex items-center justify-center text-center font-medium text-text-base backface-hidden">
                        <p class="text-lg leading-snug">{card.front}</p>
                      </div>

                      {/* Back Side */}
                      <div class="absolute inset-0 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-center text-center font-semibold text-secondary rotate-y-180 backface-hidden">
                        <p class="text-lg leading-snug">{card.back}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div class={`absolute -bottom-5 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 ${exitState() ? 'hidden' : ''}`}>
                    <button 
                      onClick={(e) => markCard(card.id, 'left', e)}
                      class="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-text-muted hover:text-red-500 hover:border-red-200 shadow-sm transition-all hover:scale-105"
                      title="Skip"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <button 
                      onClick={(e) => markCard(card.id, 'right', e)}
                      class="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all hover:scale-105"
                      title="Complete"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                  </div>
                </div>
              </Show>
            );
          }}
        </For>
      </div>
      
      <Show when={cards().length === 0}>
        <div class="text-center mt-12 p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <p class="text-text-muted text-lg font-medium">No valid flashcards detected yet.</p>
          <p class="text-slate-400 text-sm mt-2">Paste text in 'Question : Answer' format to begin.</p>
        </div>
      </Show>
    </div>
  );
}
