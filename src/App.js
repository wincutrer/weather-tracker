import { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiFog,
  WiDayHaze,
  WiThunderstorm,
} from "react-icons/wi";

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!weather && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [weather]); // Run only when weather is null (input appears)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && weather) {
        setWeather(null); // Clear the weather data
        setCity(""); // Clear the search bar
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [weather]); // Re-run only when `weather` changes

  useEffect(() => {
    if (weather) {
      document.body.style.background = weather.isDaytime
        ? "linear-gradient(to bottom, #f7f7f7, #7cb9f2 60%)"
        : "linear-gradient(to bottom, #333333, #0c1421)";
    }
  }, [weather]);

  const conditionMapping = {
    "clear sky": { text: "Clear Skies", icon: <WiDaySunny size={45} /> },
    "few clouds": { text: "Partly Cloudy", icon: <WiCloudy size={45} /> },
    "scattered clouds": { text: "Partly Cloudy", icon: <WiCloudy size={45} /> },
    "broken clouds": { text: "Mostly Cloudy", icon: <WiCloudy size={45} /> },
    "overcast clouds": { text: "Cloudy", icon: <WiCloudy size={45} /> },
    "light rain": { text: "Light Rain", icon: <WiRain size={45} /> },
    "moderate rain": { text: "Rain", icon: <WiRain size={45} /> },
    "heavy intensity rain": { text: "Heavy Rain", icon: <WiRain size={45} /> },
    "light snow": { text: "Light Snow", icon: <WiSnow size={45} /> },
    snow: { text: "Snow", icon: <WiSnow size={45} /> },
    "heavy snow": { text: "Heavy Snow", icon: <WiSnow size={45} /> },
    mist: { text: "Misty", icon: <WiFog size={45} /> },
    fog: { text: "Foggy", icon: <WiFog size={45} /> },
    haze: { text: "Hazy", icon: <WiDayHaze size={45} /> },
    thunderstorm: { text: "Thunderstorms", icon: <WiThunderstorm size={45} /> },
    drizzle: { text: "Drizzle", icon: <WiRain size={45} /> },
  };

  const fetchCoordinates = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return null;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city},US&limit=1&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("City not found. Please try again.");
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
    if (weather) return; // Prevent fetching if weather is already displayed
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

      const formattedTime = localTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const isDaytime =
        localTime >=
          new Date((data.sys.sunrise + timezoneOffsetSeconds) * 1000) &&
        localTime < new Date((data.sys.sunset + timezoneOffsetSeconds) * 1000);

      // Get the raw condition from API and map it
      const rawCondition =
        data.weather[0]?.description.toLowerCase() || "Unknown";
      const matchedCondition = conditionMapping[rawCondition] || {
        text: rawCondition
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        icon: <WiDaySunny size={50} />, // Default to sun icon
      };

      setWeather({
        ...data,
        main: {
          ...data.main,
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          temp_max: Math.round(data.main.temp_max),
          temp_min: Math.round(data.main.temp_min),
        },
        wind: { ...data.wind, speed: Math.round(data.wind.speed) },
        formattedTime,
        isDaytime,
        formattedCondition: matchedCondition.text, // User-friendly condition text
        weatherIcon: matchedCondition.icon, // Icon associated with the condition
      });

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
      {!weather && (
        <input
          type="text"
          placeholder="San Francisco, CA"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          className="search-bar"
          ref={searchInputRef}
        />
      )}
      {loading && (
        <div className="loading-icon">
          <WiDaySunny className="sunny-spinner" />
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {weather && (
        <div className="weather-card">
          {/* Exit Button */}
          <button
            className="exit-button"
            onClick={() => {
              setWeather(null); // Clear the weather data
              setCity(""); // Clear the search query
            }}
          >
            ✖
          </button>

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
              <p className="detail-value-humidity">{weather.main.humidity}%</p>
            </div>
            <div className="detail-box conditions-box">
              <div className="weather-icon">{weather.weatherIcon}</div>
              <p className="detail-value">{weather.formattedCondition}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
