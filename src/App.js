import { useState } from "react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");

  const fetchWeather = async () => {
    if (!city) {
      setError("Please enter a city name");
      return;
    }

    console.log("Fetching weather for:", city);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=imperial`
      );

      if (!response.ok) {
        throw new Error("City not found. Please try again.");
      }

      const data = await response.json();
      console.log("Weather Data:", data);
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError(error.message);
      setWeather(null); // Reset weather data on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Weather</h1>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Enter city (ex. Marin, CA)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Get Weather</button>

      {loading && <p>Loading weather data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div>
          <h2>{weather.name}</h2>
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
