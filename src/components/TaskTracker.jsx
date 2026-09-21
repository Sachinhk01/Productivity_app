import { useState, useEffect } from "react";

const STORAGE_KEY = "productivity-dashboard-tasks";

// Priority levels a task can have, along with the label shown on the badge.
const PRIORITIES = ["Low", "Medium", "High"];

// Read any previously saved tasks from localStorage.
// This runs once, as the initial value for useState below.
function loadTasksFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Failed to read tasks from localStorage:", err);
    return [];
  }
}

// onStatsChange is a callback passed down from App. Every time the
// task list changes, we call it so App can update the header count.
function TaskTracker({ onStatsChange }) {
  const [tasks, setTasks] = useState(loadTasksFromStorage);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

  // Whenever `tasks` changes: save it to localStorage, and report the
  // completed/total counts up to the parent via onStatsChange.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

    const completed = tasks.filter((task) => task.done).length;
    onStatsChange({ completed, total: tasks.length });
  }, [tasks, onStatsChange]);

  function handleAddTask(e) {
    e.preventDefault();

    const trimmedText = newTaskText.trim();
    if (trimmedText === "") return; // ignore empty submissions

    const newTask = {
      id: Date.now(), // simple unique id based on timestamp
      text: trimmedText,
      done: false,
      priority: newTaskPriority,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText(""); // clear the input, but keep the chosen priority
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  const completedCount = tasks.filter((task) => task.done).length;
  const percentDone =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <section className="widget-card">
      <h2>My Task builder </h2>

      {tasks.length > 0 && (
        <div className="progress-wrap">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${percentDone}%` }}
            />
          </div>
          <span className="progress-label">{percentDone}% done</span>
        </div>
      )}

      <form className="task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <select
          className="priority-select"
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value)}
          aria-label="Task priority"
        >
          {PRIORITIES.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>

      {tasks.length === 0 && (
        <p className="empty-note">No tasks yet - add your first one above.</p>
      )}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.done ? "done" : ""}`}>
            <label className="task-label">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <span>{task.text}</span>
            </label>
            <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
            <button
              className="delete-btn"
              onClick={() => deleteTask(task.id)}
              aria-label={`Delete ${task.text}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TaskTracker;
