# Wortspiel

A browser-based German word-guessing game inspired by Wordle. Players have 6 attempts to guess a secret 5-letter German word. After each guess, color-coded feedback shows which letters are correct and in the right position (green), correct but in the wrong position (yellow), or not in the word at all (gray).

## Features

- 6×5 game board — up to 6 guesses, each 5 letters
- Color-coded letter feedback (green / yellow / gray) following Wordle rules
- On-screen QWERTZ keyboard with per-letter status coloring
- Word validation against a curated list of 1,540 German 5-letter words
- "New Game" button to restart with a randomly chosen word
- Runs entirely in the browser — no backend required

## Screenshots

```
W O R T E      ← gray  / yellow / green / gray  / gray
S P I E L      ← all revealed after 6 attempts (or win message)
```

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | Vanilla JavaScript + HTML/CSS |
| Bundler  | [Vite](https://vitejs.dev/) |
| Words    | `frontend/words.lst` — 1,540 curated German 5-letter words |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Development

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and opens the browser automatically.

### Production Build

```bash
cd frontend
npm install
npm run build
```

The compiled output is written to `frontend/dist/`. Serve it with any static file server, e.g.:

```bash
npm run preview   # serves the build locally for testing
```

## Project Structure

```
mcword/
├── frontend/
│   ├── src/
│   │   ├── main.js       # game logic and rendering
│   │   └── style.css     # styles
│   ├── words.lst         # curated German 5-letter word list
│   ├── index.html        # entry point
│   └── package.json
├── specs/                # feature specs and planning docs
├── vite.config.js        # Vite config (root → frontend/)
└── README.md
```

## How to Play

1. The game picks a random secret word from the word list on load.
2. Type a 5-letter German word using the keyboard or the on-screen QWERTZ pad.
3. Press **Enter** to submit your guess.
4. Read the color feedback:
   - **Green** — correct letter, correct position
   - **Yellow** — correct letter, wrong position
   - **Gray** — letter not in the word
5. You have 6 attempts. Good luck!

## License

MIT
