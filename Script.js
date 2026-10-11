
const form = document.getElementById("form");
const statusText = document.getElementById("status");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const city = document.getElementById("city").value.trim();
  statusText.textContent = "Loading weather...";

  try {
    const url = "https://geocoding-api.open-meteo.com/v1/search?name="
      + encodeURIComponent(city) + "&count=1";
    const geo = await (await fetch(url)).json();
    if (!geo.results?.length) throw Error("City not found!");

    const place = geo.results[0];
    const api = "https://api.open-meteo.com/v1/forecast?latitude="
      + place.latitude + "&longitude=" + place.longitude
      + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m";

    const data = await (await fetch(api)).json();
    const w = data.current;
    const codes = {
      0:["☀️","Clear sky"],1:["🌤️","Mostly clear"],
      2:["⛅","Partly cloudy"],3:["☁️","Cloudy"],
      45:["🌫️","Foggy"],61:["🌧️","Rainy"],
      63:["🌧️","Rainy"],65:["⛈️","Heavy rain"],
      95:["⛈️","Thunderstorm"]
    };
    const info = codes[w.weather_code] || ["🌦️","Variable weather"];

    document.getElementById("name").textContent = place.name;
    document.getElementById("temp").textContent = Math.round(w.temperature_2m);
    document.getElementById("icon").textContent = info[0];
    document.getElementById("desc").textContent = info[1];
    document.getElementById("humidity").textContent = w.relative_humidity_2m + "%";
    document.getElementById("wind").textContent = w.wind_speed_10m + " km/h";
    statusText.textContent = "Feels like " + w.apparent_temperature + "°C";
  } catch (err) {
    statusText.textContent = err.message || "Network error. Try again.";
  }
});
