
const form = document.getElementById("form");
const cityInput = document.getElementById("city");
const statusText = document.getElementById("status");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const city = cityInput.value.trim();
  if (!city) return;

  statusText.textContent = "Loading weather...";

  try {
    const geoResponse = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) + "&count=1&language=en&format=json"
    );

    if (!geoResponse.ok) throw new Error("Network error");

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Try another city.");
    }

    const place = geoData.results[0];

    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      place.latitude +
      "&longitude=" +
      place.longitude +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m";

    const weatherResponse = await fetch(url);
    if (!weatherResponse.ok) throw new Error("Weather unavailable");

    const weatherData = await weatherResponse.json();
    const weather = weatherData.current;

    const conditions = {
      0: ["Clear sky", "☀️"],
      1: ["Mainly clear", "🌤️"],
      2: ["Partly cloudy", "⛅"],
      3: ["Overcast", "☁️"],
      45: ["Foggy", "🌫️"],
      48: ["Foggy", "🌫️"],
      51: ["Light drizzle", "🌦️"],
      53: ["Drizzle", "🌦️"],
      55: ["Heavy drizzle", "🌧️"],
      61: ["Light rain", "🌦️"],
      63: ["Rain", "🌧️"],
      65: ["Heavy rain", "🌧️"],
      71: ["Light snow", "🌨️"],
      73: ["Snow", "❄️"],
      75: ["Heavy snow", "❄️"],
      80: ["Rain showers", "🌦️"],
      81: ["Rain showers", "🌧️"],
      82: ["Heavy showers", "⛈️"],
      95: ["Thunderstorm", "⛈️"]
    };

    const condition = conditions[weather.weather_code] ||
      ["Current conditions", "🌡️"];

    document.getElementById("name").textContent =
      place.name + (place.country ? ", " + place.country : "");

    document.getElementById("temp").textContent =
      Math.round(weather.temperature_2m);

    document.getElementById("icon").textContent = condition[1];
    document.getElementById("desc").textContent = condition[0];

    document.getElementById("humidity").textContent =
      weather.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
      weather.wind_speed_10m + " km/h";

    statusText.textContent = "Weather updated successfully!";

  } catch (error) {
    statusText.textContent = error.message ||
      "Something went wrong. Please try again.";
  }
});
