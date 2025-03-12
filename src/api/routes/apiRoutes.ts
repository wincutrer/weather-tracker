import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.get("/weather", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" });
    }

    // Get city coordinates (including state if available)
    const geoResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},US&limit=1&appid=${apiKey}`
    );

    if (!geoResponse.data || geoResponse.data.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    const { lat, lon, state = "Unknown" } = geoResponse.data[0];

    // Get weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    );

    res.json({
      ...weatherResponse.data,
      state,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
