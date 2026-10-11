
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherPanel = document.getElementById("weatherPanel");

const WEATHER_CODES = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],
    56: ["Freezing drizzle", "🌧️"],
    57: ["Freezing drizzle", "🌧️"],
    61: ["Light rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    66: ["Freezing rain", "🌧️"],
    67: ["Heavy freezing rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy snow", "🌨️"],
    77: ["Snow grains", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Rain showers", "🌧️"],
    82: ["Heavy rain showers", "⛈️"],
    85: ["Snow showers", "🌨️"],
    86: ["Heavy snow showers", "❄️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Severe thunderstorm", "⛈️"]
};

function weatherInfo(code) {
    return WEATHER_CODES[code] || ["Unknown conditions", "🌡️"];
}

function showMessage(text) {
    message.textContent = text;
}

async function searchWeather(city) {
    const query = city.trim();

    if (!query) {
        showMessage("Please enter a city name.");
        return;
    }

    showMessage("Loading weather...");
    weatherPanel.hidden = true;

    try {
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(query) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Could not search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showMessage("City not found. Please check the spelling.");
            return;
        }

        const place = geoData.results[0];

        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast?" +
            "latitude=" + place.latitude +
            "&longitude=" + place.longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
            "&forecast_days=5&timezone=auto";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Could not load weather data.");
        }

        const data = await weatherResponse.json();

        displayWeather(place, data);
        saveRecentCity(place.name);
        displayRecentCities();
        showMessage("Weather updated successfully.");
        weatherPanel.hidden = false;
    } catch (error) {
        showMessage(
            "Unable to load weather. Check your internet and try again."
        );
    }
}

function displayWeather(place, data) {
    const current = data.current;
    const daily = data.daily;
    const info = weatherInfo(current.weather_code);

    document.getElementById("cityName").textContent =
        place.name + (place.country ? ", " + place.country : "");

    document.getElementById("todayLabel").textContent =
        "Current Weather • " + current.time.replace("T", " ");

    document.getElementById("weatherDescription").textContent = info[0];
    document.getElementById("weatherIcon").textContent = info[1];

    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m);

    document.getElementById("feelsLike").textContent =
        Math.round(current.apparent_temperature);

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
        current.wind_speed_10m + " km/h";

    document.getElementById("minMax").textContent =
        Math.round(daily.temperature_2m_min[0]) + " / " +
        Math.round(daily.temperature_2m_max[0]) + "°C";

    const forecast = document.getElementById("forecast");
    forecast.innerHTML = "";

    daily.time.forEach((date, index) => {
        const forecastInfo = weatherInfo(daily.weather_code[index]);

        const card = document.createElement("article");
        card.className = "forecast-card";

        const day = document.createElement("p");
        day.textContent = index === 0
            ? "Today"
            : new Date(date + "T12:00:00").toLocaleDateString(
                "en-IN",
                { weekday: "short", day: "numeric" }
            );

        const icon = document.createElement("div");
        icon.className = "forecast-icon";
        icon.textContent = forecastInfo[1];

        const condition = document.createElement("p");
        condition.textContent = forecastInfo[0];

        const temperature = document.createElement("div");
        temperature.className = "forecast-temp";
        temperature.textContent =
            Math.round(daily.temperature_2m_max[index]) + "° / " +
            Math.round(daily.temperature_2m_min[index]) + "°";

        card.append(day, icon, condition, temperature);
        forecast.appendChild(card);
    });
}

function getRecentCities() {
    try {
        const cities = JSON.parse(
            localStorage.getItem("weatherRecentCities")
        );
        return Array.isArray(cities) ? cities : [];
    } catch (error) {
        return [];
    }
}

function saveRecentCity(city) {
    const cities = getRecentCities().filter(
        name => name.toLowerCase() !== city.toLowerCase()
    );

    cities.unshift(city);

    try {
        localStorage.setItem(
            "weatherRecentCities",
            JSON.stringify(cities.slice(0, 5))
        );
    } catch (error) {
        // Weather search still works if storage is unavailable.
    }
}

function displayRecentCities() {
    const container = document.getElementById("recentCities");
    container.innerHTML = "";

    getRecentCities().forEach(city => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = city;

        button.addEventListener("click", () => {
            cityInput.value = city;
            searchWeather(city);
        });

        container.appendChild(button);
    });
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchWeather(cityInput.value);
});

displayRecentCities();
