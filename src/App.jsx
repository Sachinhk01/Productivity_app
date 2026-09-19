import { useState } from "react";
import ClockGreeting from "./components/ClockGreeting.jsx";
import TaskTracker from "./components/TaskTracker.jsx";
import DailyQuote from "./components/DailyQuote.jsx";
import WeatherWidget from "./components/WeatherWidget.jsx";
import "./App.css";


function App() {
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-eyebrow">
          <span className="live-dot" /> Live dashboard
        </div>
        <h1>Productivity &amp; Activity Dashboard</h1>
        <p className="header-subtitle">
          Your day, your tasks, and the world outside — in one place.
        </p>
  
        <div className="task-summary-pill">
          <span className="task-summary-count">
            {taskStats.completed}/{taskStats.total}
          </span>
          tasks completed
        </div>
      </header>

      <main className="widget-grid">
        <ClockGreeting />
        <TaskTracker onStatsChange={setTaskStats} />
        <DailyQuote />
        <WeatherWidget />
      </main>
    </div>
  );
}

export default App;
