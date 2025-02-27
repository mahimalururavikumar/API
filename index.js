import express from "express";
import axios from "axios";
import { tryEach } from "async";

const app = express();
const PORT = 3000;

// Replace this with your OpenWeatherMap API key
const WEATHER_API_KEY = "c9ea9cfaed197460867682c9ea7bd286";
const NEWS_API_KEY = '0aea496ee05e46e48ed84677dbb91678'
const MAP_API_KEY = '60c6f83da1a04d73b391c999692d321f'


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Serve the home page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ success: false, message: "Latitude and longitude are required" });
  }
  try {
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          units: "metric",
          appid: WEATHER_API_KEY,
        },
      }
    );

    const weather = {
      temp: weatherResponse.data.main.temp,
      description: weatherResponse.data.weather[0].description,
      city: weatherResponse.data.name,
    };

    res.json({ success: true, weather });
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch weather data" });
  }
});

app.get("/findweather", async (req, res) => {
  res.render("weather", { weatherData: null, error: null });
});

app.get('/news', async(req, res) =>{

  const now = new Date();
  now.setDate(now.getDate()-2);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=Andhra%20Pradesh&from=${formattedDate}&sortBy=publishedAt&apiKey=0aea496ee05e46e48ed84677dbb91678`);
    res.render('news',{news: response.data});
  } catch (error) {
    console.error("Error fetching news data:", error.message);
    res.render('/news',{news: null});
  }

});

app.get('/map', async (req, res) =>{
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json',{
      params:{
        q: '10.01234 79.01234',
        key: MAP_API_KEY
      }
    });
    console.log(response.data)
  
    res.render('map', {map: response.data});
  } catch (error) {
    console.error("Error fetching map data:", error.message);
    res.render('map',{map: null});
  }
})

app.post("/whetherForCity", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: req.body.city,
          units: "metric",
          appid: WEATHER_API_KEY,
        },
      }
    );
    const weatherData = {
      temperature: response.data.main.temp,
      windSpeed: response.data.wind.speed,
      city: response.data.name,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
    };
    res.render("weather", { weatherData, error: null });
  } catch (error) {
    console.error("Failed to fetch weather data:", error.message);
    res.render("weather", {
      weatherData: null,
      error: "Unable to fetch weather data. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
