import { useState, useEffect } from "react";

function DailyQuote() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pulled out as its own function so both useEffect (on mount) and
  // the "New Quote" button can call it.
  async function fetchQuote() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("https://dummyjson.com/quotes/random");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // DummyJSON returns { id, quote, author } - normalize the field
      // names so the JSX below stays simple to read.
      setQuote({ content: data.quote, author: data.author });
    } catch (err) {
      console.error(err);
      setError("Unable to load a quote right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch one quote automatically when the widget first loads.
  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <section className="widget-card quote-card">
      <h2>Daily Quote</h2>

      {loading && (
        <div className="quote-skeleton">
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>
      )}

      {!loading && error && <p className="status-note error-note">{error}</p>}

      {!loading && !error && quote && (
        <blockquote className="quote-block">
          <span className="quote-mark" aria-hidden="true">
            "
          </span>
          <p className="quote-text">{quote.content}</p>
          <footer className="quote-author">— {quote.author}</footer>
        </blockquote>
      )}

      <button className="secondary-btn" onClick={fetchQuote} disabled={loading}>
        <span className="btn-icon">↻</span> New Quote
      </button>
    </section>
  );
}

export default DailyQuote;
