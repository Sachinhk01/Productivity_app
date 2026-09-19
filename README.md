# Interactive Productivity & Activity Dashboard

A single-page React dashboard made of four connected widgets — built to
demonstrate core React patterns: hooks, lifting state up, side effects with
cleanup, localStorage persistence, and multi-step API calls.

## Features

- **Live Clock & Greeting** — current time, updating every second, with a
  greeting and matching icon (🌅 ☀️ 🌇 🌙) that changes based on the hour
- **Task Tracker** — add, complete, and delete tasks, each with a
  Low/Medium/High priority badge; a live progress bar shows percent
  complete; saved to `localStorage` so tasks survive a page refresh;
  reports its completed/total count up to the dashboard header
- **Daily Quote** — fetches a random quote on load with a skeleton loading
  animation, a "New Quote" button, and error handling
- **Weather Widget** — type a city, geocode it, then fetch live weather —
  temperature, a condition icon, and wind speed — with loading and error
  states
- Polished glassmorphism UI: gradient backdrop, translucent cards, hover
  lift animations, a pulsing "live" indicator, and a Google Fonts pairing
  (Plus Jakarta Sans + Space Grotesk)
- Fully responsive card-based grid layout (mobile → tablet → desktop)

## Tech Stack

- React 18 (functional components + hooks only — no class components)
- Vite
- Plain CSS (Flexbox + Grid + media queries)
- Native `fetch()` — no Axios, no state libraries, no router

## APIs Used

| Purpose | Endpoint | Key required? |
|---|---|---|
| Random quote | `https://dummyjson.com/quotes/random` | No |
| City geocoding | `https://geocoding-api.open-meteo.com/v1/search?name=CITY` | No |
| Weather forecast | `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current_weather=true` | No |

## Project Structure

```
productivity-dashboard/
├── src/
│   ├── components/
│   │   ├── ClockGreeting.jsx   # useState + useEffect(setInterval, cleanup)
│   │   ├── TaskTracker.jsx     # useState + useEffect(localStorage sync)
│   │   ├── DailyQuote.jsx      # useState + useEffect(fetch on mount)
│   │   └── WeatherWidget.jsx   # useState, two-step fetch on submit
│   ├── App.jsx                  # Parent — holds lifted task-count state
│   ├── App.css                  # Dashboard + widget styling
│   ├── index.css                # Global resets & color variables
│   └── main.jsx                  # React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## How to Install

```bash
npm install
```

## How to Run Locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## How to Build for Production

```bash
npm run build
```

Preview that build locally with:

```bash
npm run preview
```

## Deploying to Vercel

1. Push the project to a GitHub repo.
2. In Vercel, click **New Project** and import the repo.
3. Vercel auto-detects Vite — confirm **Build Command:** `npm run build`,
   **Output Directory:** `dist`.
4. Click **Deploy**.

---

## How the Code Works (Teaching Notes)

### 1. Lifting state up — the task count

`TaskTracker` owns the full task list in its own `useState`. But the
dashboard **header** (in `App.jsx`) needs to show "completed / total" —
and the header lives outside `TaskTracker`. So `App` passes a callback,
`onStatsChange`, down as a prop:

```jsx
<TaskTracker onStatsChange={setTaskStats} />
```

Inside `TaskTracker`, a `useEffect` runs every time `tasks` changes and
calls `onStatsChange({ completed, total })`, handing the summary back up
to `App`. `App` stores it in its own state (`taskStats`) and renders it
in the header. `TaskTracker` never needs to know *how* App uses that
number — it just reports it.

### 2. useEffect with cleanup — the live clock

`ClockGreeting` uses `setInterval` to update the time every second:

```jsx
useEffect(() => {
  const intervalId = setInterval(() => setNow(new Date()), 1000);
  return () => clearInterval(intervalId);
}, []);
```

The function returned from `useEffect` is the **cleanup function** —
React calls it automatically when the component unmounts. Without it,
the interval would keep firing in the background forever, updating
state on a component that no longer exists (a classic memory leak).

### 3. Persisting to localStorage — the task tracker

Two things happen together in `TaskTracker`:

- **Loading:** `useState(loadTasksFromStorage)` — passing a *function*
  to `useState` means it only runs once, on the very first render, to
  read any saved tasks out of `localStorage`.
- **Saving:** a `useEffect` that depends on `[tasks]` runs
  `localStorage.setItem(...)` every time the task list changes, so the
  latest list is always saved.

### 4. Fetching on mount — the daily quote

`DailyQuote` fetches a quote once automatically:

```jsx
useEffect(() => {
  fetchQuote();
}, []);
```

The `fetchQuote` function itself is `async`, using `await` twice (for
the fetch and for parsing the JSON), wrapped in `try/catch/finally` so
`loading` and `error` states are always handled correctly. The "New
Quote" button reuses the exact same function.

### 5. A two-step fetch — the weather widget

Open-Meteo doesn't take a city name directly, so `WeatherWidget` makes
**two** sequential API calls inside one `async` function:

1. Geocode the city name into `latitude`/`longitude`.
2. Use those coordinates to fetch the current weather.

Both `await` calls sit inside the same `try/catch`, so if either step
fails (bad city name, network error), the same `error` state and message
are shown.

### 6. Where each hook is used

| Component | useState | useEffect |
|---|---|---|
| `App.jsx` | ✅ (`taskStats`) | — |
| `ClockGreeting.jsx` | ✅ (`now`) | ✅ (interval + cleanup) |
| `TaskTracker.jsx` | ✅ (`tasks`, `newTaskText`) | ✅ (save + report stats) |
| `DailyQuote.jsx` | ✅ (`quote`, `loading`, `error`) | ✅ (fetch on mount) |
| `WeatherWidget.jsx` | ✅ (`city`, `weather`, `loading`, `error`) | — (fetch runs on form submit instead) |

---

## Suggested Teaching Flow

1. Start with `App.jsx` — show the four widgets being rendered, and the
   one piece of lifted state (`taskStats`).
2. Walk through `ClockGreeting.jsx` — explain `setInterval` and *why*
   the cleanup function matters.
3. Walk through `TaskTracker.jsx` — explain the lazy `useState` initial
   value, then the `useEffect` that both saves to `localStorage` and
   reports stats up to `App` via the callback prop.
4. Walk through `DailyQuote.jsx` — a simple "fetch once on mount"
   pattern, reused by a button click.
5. Walk through `WeatherWidget.jsx` — a two-step fetch triggered by a
   form submission instead of `useEffect`.
6. Run `npm run dev`, add a few tasks, refresh the page, and show that
   they're still there.
