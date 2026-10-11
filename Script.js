
async function getWeather() {
  const city = document.getElementById("city").value.trim();
  const result = document.getElementById("result");

  if (city === "") {
    result.innerText = "Please enter a city name";
    return;
  }

  result.innerText = "Loading...";

  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) + "&count=1";

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      result.innerText = "City not found";
      return;
    }

    const place = data.results[0];

    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const weatherResponse = await fetch(weatherURL);
    const weather = await weatherResponse.json();
    const current = weather.current;

    result.innerHTML = `
      <h2>${place.name}</h2>
      <p>Temperature: ${current.temperature_2m}°C</p>
      <p>Humidity: ${current.relative_humidity_2m}%</p>
      <p>Wind Speed: ${current.wind_speed_10m} km/h</p>
    `;
  } catch (error) {
    result.innerText = "Error fetching weather. Try again.";
  }
}
