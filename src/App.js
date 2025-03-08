import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const searchInputRef = useRef(null);

  //  Activates search bar when the component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Update body background depending on time of day
  useEffect(() => {
    if (weather) {
      document.body.style.background = weather.isDaytime
        ? "linear-gradient(to bottom, #f7f7f7, #7cb9f2 60%)"
        : "linear-gradient(to bottom, #333333, #0c1421)";
    }
  }, [weather]);

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

      // Get last updated timestamp and timezone offset
      const utcSeconds = data.dt;
      const timezoneOffsetSeconds = data.timezone;
      const localTime = new Date((utcSeconds + timezoneOffsetSeconds) * 1000);

      // Format the date and time
      const formattedDate = localTime.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const formattedTime = localTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC",
      });

      // Convert sunrise and sunset times to local time
      const sunriseTime = new Date(
        (data.sys.sunrise + timezoneOffsetSeconds) * 1000
      );
      const sunsetTime = new Date(
        (data.sys.sunset + timezoneOffsetSeconds) * 1000
      );

      // Determine if it's daytime or nighttime
      const isDaytime = localTime >= sunriseTime && localTime < sunsetTime;

      // Map API conditions to user-friendly language
      const conditionMapping = {
        "clear sky": "Clear",
        "few clouds": "Partly Cloudy",
        "scattered clouds": "Partly Cloudy",
        "broken clouds": "Mostly Cloudy",
        "overcast clouds": "Cloudy",
        "light rain": "Light Rain",
        "moderate rain": "Rain",
        "heavy intensity rain": "Heavy Rain",
        "light snow": "Light Snow",
        snow: "Snow",
        "heavy snow": "Heavy Snow",
        mist: "Misty",
        fog: "Foggy",
        haze: "Hazy",
        thunderstorm: "Thunderstorms",
        drizzle: "Drizzle",
      };

      // Get the raw condition from API and map it
      const rawCondition =
        data.weather[0]?.description.toLowerCase() || "Unknown";
      const formattedCondition =
        conditionMapping[rawCondition] ||
        rawCondition
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      // Round values
      const roundedData = {
        ...data,
        main: {
          ...data.main,
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          temp_max: Math.round(data.main.temp_max),
          temp_min: Math.round(data.main.temp_min),
        },
        wind: {
          ...data.wind,
          speed: Math.round(data.wind.speed),
          gust: data.wind.gust ? Math.round(data.wind.gust) : null,
        },
        formattedDate,
        formattedTime,
        isDaytime,
        formattedCondition, // ✅ Now conditions will display correctly!
      };

      setWeather(roundedData);
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
        placeholder="Enter city (e.g., New York)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
        className="search-bar"
        ref={searchInputRef}
      />

      {loading && <p>Loading weather data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>
            {weather.name}, {state}
          </h2>
          <p className="current-temp">{weather.main.temp}°F</p>
          <p className="temp-range">
            H: {weather.main.temp_max}°F | L: {weather.main.temp_min}°F
          </p>
          <p className="last-updated">Last updated: {weather.formattedTime}</p>

          <div className="weather-details">
            <div className="detail-box">
              <p className="detail-label">Feels Like</p>
              <p className="detail-value">{weather.main.feels_like}°F</p>
            </div>
            <div className="detail-box">
              <p className="detail-label">Wind</p>
              <p className="detail-value">{weather.wind.speed} mph</p>
            </div>
            <div className="detail-box">
              <p className="detail-label">Humidity</p>
              <p className="detail-value">{weather.main.humidity}%</p>
            </div>
            <div className="detail-box">
              <p className="detail-label">Conditions</p>
              <p className="detail-value">
                {weather.formattedCondition
                  ? weather.formattedCondition
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
