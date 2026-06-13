import { createSignal, createEffect, onMount, For, Show } from 'solid-js';

export default function FlashcardApp() {
  const [text, setText] = createSignal('');
  const [cards, setCards] = createSignal([]);
  const [flippedCards, setFlippedCards] = createSignal(new Set());
  const [exitedCards, setExitedCards] = createSignal(new Map());
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  let isMounted = false;

  onMount(() => {
    try {
      const saved = localStorage.getItem('user_flashcards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCards(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse user_flashcards from localStorage', err);
    }
    isMounted = true;
  });

  createEffect(() => {
    const currentCards = cards();
    if (isMounted) {
      localStorage.setItem('user_flashcards', JSON.stringify(currentCards));
    }
  });

  const handleInput = (e) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      generateFromAPI();
    }
  };

  const generateFromAPI = async () => {
    if (!text().trim() || isLoading()) return;
    
    setIsLoading(true);
    setError('');
    setCards([]);
    setFlippedCards(new Set());
    setExitedCards(new Map());

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text() })
      });

      if (!res.ok) {
        throw new Error('Failed to generate flashcards. Make sure your API key is correct.');
      }

      const data = await res.json();
      
      if (data.flashcards && Array.isArray(data.flashcards)) {
        const withIds = data.flashcards.map(c => ({
          id: Math.random().toString(36).substring(2, 9),
          front: c.question,
          back: c.answer
        }));
        setCards(withIds);
        // Clear textarea after successful generation as polish
        setText('');
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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

  const restartDeck = () => {
    setFlippedCards(new Set());
    setExitedCards(new Map());
  };

  const clearAll = () => {
    setCards([]);
    setFlippedCards(new Set());
    setExitedCards(new Map());
    setError('');
  };

  return (
    <div class="p-6 max-w-5xl mx-auto font-sans">
      <div class="text-center mb-10 mt-6">
        <h1 class="text-4xl font-bold text-primary mb-3 tracking-tight">Instant Flashcards</h1>
        <p class="text-text-muted text-lg">Powered by Vercel AI SDK & Gemini</p>
      </div>
      
      <div class="bg-card p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 relative">
        <textarea
          class="w-full h-40 p-4 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none resize-y text-text-base placeholder-text-muted transition-all duration-200 bg-transparent"
          placeholder="Paste your study material here and hit Enter...&#10;Example: 'Mitochondria is the powerhouse of the cell.'"
          value={text()}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        
        {/* Generate Button integrated near the textarea */}
        <div class="absolute bottom-4 right-4">
          <button 
            class="bg-secondary hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center min-w-[140px]"
            onClick={generateFromAPI}
            disabled={isLoading() || !text().trim()}
          >
            {isLoading() ? (
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Generate'}
          </button>
        </div>
      </div>

      <Show when={error()}>
        <div class="flex justify-center mb-8">
          <p class="text-red-500 text-sm font-medium bg-red-50 py-2 px-4 rounded-lg border border-red-100">{error()}</p>
        </div>
      </Show>

      {/* Toolbar for the generated cards */}
      <Show when={cards().length > 0}>
        <div class="flex justify-between items-center mb-6 px-2">
          <p class="text-text-muted font-medium text-sm">
            {cards().length - exitedCards().size} cards remaining
          </p>
          <div class="flex gap-3">
            <button onClick={restartDeck} class="text-sm font-medium text-secondary hover:text-blue-800 transition-colors">
              Restart Deck
            </button>
            <button onClick={clearAll} class="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors">
              Clear All
            </button>
          </div>
        </div>
      </Show>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 pb-12">
        <For each={cards()}>
          {(card) => {
            const isFlipped = () => flippedCards().has(card.id);
            const exitState = () => exitedCards().get(card.id);

            const [hidden, setHidden] = createSignal(false);
            
            if (exitState()) {
              setTimeout(() => setHidden(true), 450);
            } else {
              // If restarted, unhide
              setHidden(false);
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
                      <div class="absolute inset-0 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-center text-center font-semibold text-secondary rotate-y-180 backface-hidden overflow-y-auto">
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
      
      <Show when={cards().length === 0 && !isLoading() && !error()}>
        <div class="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <p class="text-text-muted text-lg font-medium">Ready to start studying?</p>
          <p class="text-slate-400 text-sm mt-2">Paste your notes and hit Enter to build flashcards instantly.</p>
        </div>
      </Show>
    </div>
  );
}
