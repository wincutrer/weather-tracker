import { useState } from "react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const fetchCoordinates = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city},US&limit=1&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );
      const data = await response.json();

      if (data.length === 0) {
        throw new Error(
          "City not found. Try adding a state code (e.g., Marin, CA)."
        );
      }

      return {
        lat: data[0].lat,
        lon: data[0].lon,
        city: data[0].name,
        state: data[0].state || "Unknown",
      };
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    const location = await fetchCoordinates();
    if (!location) return;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=imperial`
      );

      const data = await response.json();
      setWeather(data);
      setState(location.state);
    } catch (error) {
      setError("Error fetching weather data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Weather Man</h1>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Enter city (e.g., Marin, CA)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
      />
      <button onClick={fetchWeather}>Search</button>

      {loading && <p>Loading weather data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>
            {weather.name}, {state}
          </h2>
          <p>Temperature: {weather.main.temp}°F</p>
          <p>Feels Like: {weather.main.feels_like}°F</p>
          <p>
            Wind: {weather.wind.speed} mph{" "}
            {weather.wind.gust ? `/ Gust: ${weather.wind.gust} mph` : ""}
          </p>
          <p>Condition: {weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
