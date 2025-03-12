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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Condition mapping for icons + user friendly text
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
  }, [weather]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && weather) {
        setWeather(null);
        setCity("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [weather]);

  useEffect(() => {
    if (weather) {
      console.log("Weather state updated. isDaytime:", weather.isDaytime);
      document.body.style.background = weather.isDaytime
        ? "linear-gradient(to bottom, #f7f7f7, #7cb9f2 60%)"
        : "linear-gradient(to bottom, #333333, #0c1421)";
    } else {
      document.body.style.background =
        "linear-gradient(to bottom, #f7f7f7, #7cb9f2 60%)"; // Default color
    }
  }, [weather]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching weather for:", city);
      const res = await fetch(`/api/weather?city=${city}`);

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const stateName = data.state || "Unknown";

      // Convert timestamps using Day.js for accurate timezones
      const cityLocalTime = dayjs.unix(data.dt).utcOffset(data.timezone / 60);
      const sunriseTime = dayjs
        .unix(data.sys.sunrise)
        .utcOffset(data.timezone / 60);
      const sunsetTime = dayjs
        .unix(data.sys.sunset)
        .utcOffset(data.timezone / 60);

      console.log("City Local Time:", cityLocalTime.format("h:mm A"));
      console.log("Sunrise Time:", sunriseTime.format("h:mm A"));
      console.log("Sunset Time:", sunsetTime.format("h:mm A"));

      const isDaytime =
        cityLocalTime.isAfter(sunriseTime) &&
        cityLocalTime.isBefore(sunsetTime);

      const lastUpdated = cityLocalTime.format("h:mm A");

      const matchedCondition = conditionMapping[
        data.weather[0]?.description
      ] || {
        text: "Unknown",
        icon: <WiDaySunny size={50} />,
      };

      const updatedWeather = {
        ...data,
        name: data.name,
        main: {
          ...data.main,
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          temp_max: Math.round(data.main.temp_max),
          temp_min: Math.round(data.main.temp_min),
          humidity: data.main.humidity,
        },
        wind: { ...data.wind, speed: Math.round(data.wind.speed) },
        formattedTime: lastUpdated,
        isDaytime,
        formattedCondition: matchedCondition.text,
        weatherIcon: matchedCondition.icon,
      };

      console.log("Updated Weather Object:", updatedWeather);
      setWeather(updatedWeather);
      setState(stateName);
    } catch (err) {
      console.error("Error in fetchWeather:", err);
      setError(err.message || "Error fetching weather data.");
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
          <button
            className="exit-button"
            onClick={() => {
              setWeather(null);
              setCity("");
              document.body.style.background =
                "linear-gradient(to bottom, #f7f7f7, #7cb9f2 60%)";
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
