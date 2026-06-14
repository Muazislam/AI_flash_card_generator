# ⚡ AI Flashcard Generator

An AI-powered, high-converting flashcard generator that converts raw study materials, textbook sections, or lecture notes into clear, concise study cards in seconds. Built with **Astro**, **SolidJS**, **Tailwind CSS**, and **Gemini AI**.

Features a dual-theme system (white & blue for Light Mode, black & yellow for Dark Mode) and premium anime-style illustrations of legendary scholars and geniuses.

---

## 🎯 The Concept

Studying large blocks of text is inefficient. Modern active recall relies on **flashcards**, but writing them manually is time-consuming. 

The **AI Flashcard Generator** bridges this gap:
- **Instant Generation**: Paste notes, articles, or transcripts and get custom flashcards instantly.
- **Smart Formatting**: Leverages Gemini AI to generate high-quality questions and concise answers, filtering out fluff.
- **Dual-Theme Focus Mode**: Custom color schemes designed for focus and conversion:
  - **Light Mode**: High-contrast blue-and-white theme.
  - **Dark Mode**: Low-fatigue black-and-yellow theme.
- **Interactive Review**: Flip cards with a 3D perspective rotation, mark them as complete or skipped, and track your session progress in real time.

---

## 🛠️ Step-by-Step Installation Guide

Since files in `.gitignore` (like environment secrets and local cache folders) are not uploaded to GitHub, follow this step-by-step guide to run this project locally on your system.

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18.x or higher recommended)
- **npm** (comes packaged with Node.js)
- An **API Key** (Either a **Gemini API Key** [Get for free here](https://aistudio.google.com/) or an **OpenAI API Key** [Get here](https://platform.openai.com/))

---

### Step 1: Clone the Repository & Star

First, **give this repository a star ⭐** to support the project! Then, clone it to your local machine:
```bash
git clone https://github.com/Muazislam/AI_flash_card_generator.git
cd AI_flash_card_generator
```

---

### Step 2: Install Project Dependencies

Run the install command to configure all required packages:
```bash
npm install
```

This will download and configure:
- **Astro**: The static site framework
- **SolidJS**: The fine-grained reactive component framework
- **Tailwind CSS**: The utility-first styling engine
- **Vercel AI SDK (`ai` & `@ai-sdk/google`)**: Interface with the Google Gemini API

---

### Step 3: Configure Environment Variables (`.env`)

Because API keys and secrets are excluded from the repository via `.gitignore`, you must configure them manually:

1. Create a new file named `.env` in the **root** directory of the project:
   - *On Windows (PowerShell)*: `New-Item .env`
   - *On macOS/Linux (Terminal)*: `touch .env`
2. Open the `.env` file in your text editor and add your API key:
   ```env
   # Default: Use Gemini
   GEMINI_API_KEY=your_gemini_api_key_here

   # Alternative: Use OpenAI (Optional)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

---

### Step 4: Run the Development Server

Start the local Astro development server:
```bash
npm run dev
```

The output in your terminal will display the local development address (typically `http://localhost:4321/` or `http://localhost:4322/` if the port is occupied):
```text
 astro  v4.16.19 ready in 1.3s

┃ Local    http://localhost:4321/
┃ Network  use --host to expose
```

Open the displayed link in your web browser to start generating flashcards!

---

### Step 5: Build for Production (Optional)

To build a production-optimized version of the application:
```bash
npm run build
```
This generates the optimized production bundle inside the `dist/` directory (which is also ignored by Git).

---

## 📦 Project Structure Overview

Here are the key directories you will work with:
- `/src/components/FlashcardApp.jsx` — The core SolidJS application logic, state, and UI.
- `/src/pages/index.astro` — Main page wrapper, theme toggle logic, and responsive anime character layouts.
- `/src/styles/global.css` — Custom themes (Light/Dark variables), keyframe animations, and 3D card-flip styles.
- `/src/pages/api/generate.ts` — Server API endpoint route handling request validations.
- `/src/utils/generateFlashcards.ts` — Utility helper that initiates connection with `gemini-3.5-flash` model and prompts it for JSON formatted cards.
- `/public/images/` — Contains processed high-resolution character graphics.
