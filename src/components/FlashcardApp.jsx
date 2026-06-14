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
      e.preventDefault();
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

  // Computed progress
  const completedCount = () => exitedCards().size;
  const totalCount = () => cards().length;
  const progressPercent = () => totalCount() > 0 ? (completedCount() / totalCount()) * 100 : 0;

  return (
    <div class="p-4 sm:p-6 max-w-4xl mx-auto font-sans relative">

      {/* ═══ HEADER ═══ */}
      <div class="text-center mb-10 mt-6">
        <div class="inline-block mb-4">
          <span class="text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-border-subtle text-text-muted" style="background: var(--color-surface-glass); backdrop-filter: blur(8px);">
            Powered by Gemini AI
          </span>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading gradient-text mb-4 tracking-tight leading-tight">
          Instant Flashcards
        </h1>
        <p class="text-text-muted text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          Paste your study material. Get smart, concise flashcards in seconds.
        </p>
      </div>

      {/* ═══ INPUT AREA ═══ */}
      <div class="glass-static rounded-2xl p-1.5 mb-8 relative" id="input-area">
        <textarea
          id="study-input"
          class="w-full h-36 sm:h-40 p-4 sm:p-5 rounded-xl resize-none text-text-primary placeholder-text-muted transition-all duration-200 bg-transparent focus:ring-2 focus:ring-offset-0"
          style="--tw-ring-color: var(--color-accent); font-size: 15px; line-height: 1.6;"
          placeholder={"Paste your study material here and hit Enter...\nExample: 'Mitochondria is the powerhouse of the cell.'"}
          value={text()}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        
        {/* Generate Button */}
        <div class="absolute bottom-4 right-4">
          <button
            id="generate-btn"
            class="btn-accent font-semibold py-2.5 px-7 rounded-xl flex items-center justify-center gap-2 min-w-[140px] text-sm"
            onClick={generateFromAPI}
            disabled={isLoading() || !text().trim()}
          >
            <Show when={isLoading()} fallback={
              <>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Generate
              </>
            }>
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </Show>
          </button>
        </div>
      </div>

      {/* ═══ ERROR ═══ */}
      <Show when={error()}>
        <div class="flex justify-center mb-8 animate-scale-in">
          <p class="text-sm font-medium py-2.5 px-5 rounded-xl border flex items-center gap-2" style={`color: var(--color-danger); background: var(--color-danger-bg); border-color: var(--color-danger);`}>
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error()}
          </p>
        </div>
      </Show>

      {/* ═══ TOOLBAR + PROGRESS ═══ */}
      <Show when={cards().length > 0}>
        <div class="mb-8 px-1" id="deck-toolbar">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-3">
              <p class="text-text-muted font-medium text-sm">
                <span class="text-text-primary font-semibold">{cards().length - exitedCards().size}</span> cards remaining
              </p>
              <Show when={exitedCards().size > 0}>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background: var(--color-accent-glow); color: var(--color-accent);">
                  {Math.round(progressPercent())}% done
                </span>
              </Show>
            </div>
            <div class="flex gap-4">
              <button id="restart-btn" onClick={restartDeck} class="text-sm font-medium transition-colors hover:opacity-80" style="color: var(--color-accent);">
                ↻ Restart
              </button>
              <button id="clear-btn" onClick={clearAll} class="text-sm font-medium text-text-muted transition-colors hover:opacity-80" style="color: var(--color-danger);">
                ✕ Clear
              </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style={`width: ${progressPercent()}%`}></div>
          </div>
        </div>
      </Show>

      {/* ═══ CARD GRID ═══ */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 pb-12">
        <For each={cards()}>
          {(card, index) => {
            const isFlipped = () => flippedCards().has(card.id);
            const exitState = () => exitedCards().get(card.id);

            const [hidden, setHidden] = createSignal(false);
            
            if (exitState()) {
              setTimeout(() => setHidden(true), 450);
            } else {
              setHidden(false);
            }

            // Staggered animation delay
            const animDelay = `${index() * 70}ms`;

            return (
              <Show when={!hidden()}>
                <div
                  class="flex flex-col items-center group relative animate-fade-in-up"
                  style={`animation-delay: ${animDelay};`}
                >
                  <div 
                    class={`w-full h-56 perspective-1000 cursor-pointer duration-500 ease-out transition-transform ${
                      exitState() === 'left' ? 'slide-out-left' : exitState() === 'right' ? 'slide-out-right' : ''
                    }`}
                    onClick={() => toggleFlip(card.id)}
                  >
                    <div 
                      class={`relative w-full h-full duration-500 ease-out preserve-3d will-change-transform rounded-2xl ${
                        isFlipped() ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front Side */}
                      <div class="absolute inset-0 glass rounded-2xl p-6 flex items-center justify-center text-center backface-hidden">
                        <p class="text-base sm:text-lg leading-relaxed font-medium text-text-primary">{card.front}</p>
                      </div>

                      {/* Back Side */}
                      <div class="absolute inset-0 rounded-2xl p-6 flex items-center justify-center text-center rotate-y-180 backface-hidden overflow-y-auto" style="background: var(--color-card-hover); backdrop-filter: blur(16px); border: 1px solid var(--color-border-accent);">
                        <p class="text-base sm:text-lg leading-relaxed font-semibold" style="color: var(--color-accent);">{card.back}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div class={`absolute -bottom-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 ${exitState() ? 'hidden' : ''}`}>
                    <button 
                      onClick={(e) => markCard(card.id, 'left', e)}
                      class="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95"
                      style="background: var(--color-card-hover); border: 1px solid var(--color-border-subtle); color: var(--color-text-muted);"
                      title="Skip"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <button 
                      onClick={(e) => markCard(card.id, 'right', e)}
                      class="flex items-center justify-center w-10 h-10 rounded-full btn-accent transition-all hover:scale-110 active:scale-95"
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
      
      {/* ═══ EMPTY STATE ═══ */}
      <Show when={cards().length === 0 && !isLoading() && !error()}>
        <div class="text-center py-16 px-8 rounded-2xl glass-static" id="empty-state">
          <div class="text-5xl mb-5" style="animation: float 3s ease-in-out infinite;">📚</div>
          <p class="text-text-primary text-xl font-heading font-semibold mb-2">Ready to study smarter?</p>
          <p class="text-text-muted text-sm max-w-md mx-auto leading-relaxed">
            Paste your lecture notes, textbook passages, or any study material above.<br />
            AI will generate smart flashcards for you instantly.
          </p>
          <div class="flex justify-center gap-6 mt-6">
            <div class="flex items-center gap-2 text-xs text-text-muted">
              <span style="color: var(--color-accent);">⚡</span> AI-Powered
            </div>
            <div class="flex items-center gap-2 text-xs text-text-muted">
              <span style="color: var(--color-accent);">🎯</span> Smart Questions
            </div>
            <div class="flex items-center gap-2 text-xs text-text-muted">
              <span style="color: var(--color-accent);">💾</span> Auto-Saved
            </div>
          </div>
        </div>
      </Show>

      {/* ═══ FOOTER ═══ */}
      <div class="text-center mt-8 pb-4">
        <p class="text-text-muted text-xs opacity-60">
          Built with Astro · SolidJS · Gemini AI
        </p>
      </div>
    </div>
  );
}
