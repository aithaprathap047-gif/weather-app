
const $ = id => document.getElementById(id);
const form = $("search-form");
const input = $("city-input");
const button = $("search-button");

const codes = {
  0: ["Clear Sky", "☀️"],
  1: ["Mostly Clear", "🌤️"],
  2: ["Partly Cloudy", "⛅"],
  3: ["Cloudy", "☁️"],
  45: ["Foggy", "🌫️"],
  48: ["Foggy", "🌫️"],
  51: ["Light Drizzle", "🌦️"],
  53: ["Drizzle", "🌧️"],
  55: ["Heavy Drizzle", "🌧️"],
  61: ["Light Rain", "🌦️"],
  63: ["Rainy", "🌧️"],
  65: ["Heavy Rain", "🌧️"],
  71: ["Light Snow", "🌨️"],
  73: ["Snowy", "❄️"],
  75: ["Heavy Snow", "❄️"],
  80: ["Rain Showers", "🌦️"],
  81: ["Rain Showers", "🌧️"],
  82: ["Heavy Showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm", "⛈️"],
  99: ["Thunderstorm", "⛈️"]
};

function weather(code) {
  return codes[code] || ["Weather", "🌤️"];
}

function status(message, error = false) {
  $("status").textContent = message;
  $("status").style.color = error ? "#ffe0e0" : "#fff0f8";
}

async function searchCity(city) {
  const url = new URL(
    "https://geocoding-api.open-meteo.com/v1/search"
  );

  url.search = new URLSearchParams({
    name: city,
    count: "10",
    language: "en",
    format: "json"
  });

  const response = await fetch(url);
  if (!response.ok) throw Error("City search failed.");

  const data = await response.json();
  if (!data.results?.length) {
    throw Error("City not found! Check the spelling.");
  }

  return data.results.find(
    p => p.name.toLowerCase() === city.toLowerCase()
  ) || data.results[0];
}

async function getWeather(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.search = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    forecast_days: "5",
    timezone: "auto"
  });

  const response = await fetch(url);
  if (!response.ok) throw Error("Weather data unavailable.");

  return response.json();
}

function display(place, data) {
  const c = data.current;
  const [desc, icon] = weather(c.weather_code);

  $("city-name").textContent = place.name;
  $("country").textContent =
    [place.admin1, place.country].filter(Boolean).join(", ");

  $("date").textContent = new Date().toLocaleDateString(
    "en-IN", { day: "numeric", month: "short", year: "numeric" }
  );

  $("icon").textContent = icon;
  $("temperature").textContent = Math.round(c.temperature_2m) + "°C";
  $("description").textContent = desc;
  $("feels").textContent = Math.round(c.apparent_temperature);
  $("feels2").textContent = Math.round(c.apparent_temperature) + "°C";
  $("humidity").textContent = c.relative_humidity_2m + "%";
  $("wind").textContent = Math.round(c.wind_speed_10m) + " km/h";

  const forecast = $("forecast");
  forecast.replaceChildren();

  data.daily.time.forEach((date, i) => {
    const [text, emoji] = weather(data.daily.weather_code[i]);
    const card = document.createElement("div");
    card.className = "forecast-card";

    const day = document.createElement("p");
    day.className = "day";
    day.textContent = i === 0 ? "Today" :
      new Date(date + "T12:00:00").toLocaleDateString(
        "en", { weekday: "short" }
      );

    const iconEl = document.createElement("span");
    iconEl.className = "emoji";
    iconEl.textContent = emoji;
    iconEl.title = text;

    const range = document.createElement("p");
    range.className = "range";
    range.textContent =
      Math.round(data.daily.temperature_2m_max[i]) + "° / " +
      Math.round(data.daily.temperature_2m_min[i]) + "°";

    const rain = document.createElement("p");
    rain.className = "rain";
    const chance = data.daily.precipitation_probability_max[i];
    rain.textContent = "Rain " + (chance ?? "—") + "%";

    card.append(day, iconEl, range, rain);
    forecast.appendChild(card);
  });

  $("weather").classList.remove("hidden");
}

async function runSearch(city) {
  city = city.trim();

  if (!city) {
    status("Please enter a city name.", true);
    return;
  }

  button.disabled = true;
  button.textContent = "Loading...";
  status("Finding live weather for " + city + "...");

  try {
    const place = await searchCity(city);
    const data = await getWeather(place.latitude, place.longitude);
    display(place, data);
    status("✨ Weather updated for " + place.name);
  } catch (error) {
    status(error instanceof TypeError
      ? "Internet problem! Check your connection."
      : error.message || "Something went wrong.", true);
  } finally {
    button.disabled = false;
    button.textContent = "🔍 Search";
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  runSearch(input.value);
});

runSearch("Hyderabad");
