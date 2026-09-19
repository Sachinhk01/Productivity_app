import { useState, useEffect } from "react";

// Figure out a greeting - and a matching icon - based on the hour.
function getGreeting(hour) {
  if (hour < 5) return { text: "Still up?", icon: "🌙" };
  if (hour < 12) return { text: "Good morning", icon: "🌅" };
  if (hour < 17) return { text: "Good afternoon", icon: "☀️" };
  if (hour < 21) return { text: "Good evening", icon: "🌇" };
  return { text: "Good night", icon: "🌙" };
}

function ClockGreeting() {
  // We keep the current time in state so the component re-renders
  // every time it changes.
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // setInterval keeps calling this function every 1000ms (1 second),
    // updating the time and causing a re-render.
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Cleanup function: React calls this when the component unmounts.
    // Without this, the interval would keep running forever in the
    // background, even after the component is gone - a memory leak.
    return () => clearInterval(intervalId);
  }, []); // empty array = set up the interval once, on mount

  const { text: greetingText, icon: greetingIcon } = getGreeting(now.getHours());

  // Split "10:42:07" into pieces so we can style the seconds separately.
  const timeString = now.toLocaleTimeString(undefined, { hour12: true });

  const dateString = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="widget-card clock-card">
      <div className="clock-icon">{greetingIcon}</div>
      <h2 className="clock-greeting">{greetingText}</h2>
      <p className="clock-time">{timeString}</p>
      <p className="clock-date">{dateString}</p>
    </section>
  );
}

export default ClockGreeting;
