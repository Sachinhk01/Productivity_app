import { useState } from "react";

// Open-Meteo returns a numeric "weather code" instead of a text
// description. This lookup table turns common codes into a readable
// label plus a matching emoji icon. Not every possible code is listed -
// that's fine, we fall back to a generic label/icon below.
const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Foggy", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

function describeWeatherCode(code) {
  return WEATHER_CODES[code] || { label: "Unknown conditions", icon: "🌡️" };
}

function WeatherWidget() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    const trimmedCity = city.trim();
    if (trimmedCity === "") return;

    try {
      setLoading(true);
      setError("");
      setWeather(null);

      // Step 1: turn the city name into latitude/longitude.
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          trimmedCity
        )}`
      );

      if (!geoResponse.ok) {
        throw new Error("Geocoding request failed");
      }

      const geoData = await geoResponse.json();

      // If no matching place was found, results will be empty/missing.
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: use those coordinates to get the current weather.
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      if (!weatherResponse.ok) {
        throw new Error("Weather request failed");
      }

      const weatherData = await weatherResponse.json();
      const { label, icon } = describeWeatherCode(
        weatherData.current_weather.weathercode
      );

      setWeather({
        place: `${name}, ${country}`,
        temperature: weatherData.current_weather.temperature,
        windSpeed: weatherData.current_weather.windspeed,
        condition: label,
        icon,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load weather for that city. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="widget-card">
      <h2>Weather</h2>

      <form className="weather-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter a city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && <p className="status-note">Loading weather...</p>}

      {!loading && error && <p className="status-note error-note">{error}</p>}

      {!loading && !error && !weather && !error && (
        <p className="empty-note">Search a city to see live conditions.</p>
      )}

      {!loading && !error && weather && (
        <div className="weather-result">
          <div className="weather-icon">{weather.icon}</div>
          <p className="weather-place">{weather.place}</p>
          <p className="weather-temp">{Math.round(weather.temperature)}°C</p>
          <p className="weather-condition">{weather.condition}</p>
          <p className="weather-wind">💨 {weather.windSpeed} km/h wind</p>
        </div>
      )}
    </section>
  );
}

export default WeatherWidget;
