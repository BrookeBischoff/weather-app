const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');
const errorMsg = document.getElementById('error-msg');
const unitToggle = document.getElementById('unit-toggle');
let currentTempC = null;
let isFahrenheit = true;

// Weather code descriptions from Open-Meteo
const weatherDescriptions = {
  0: 'Clear sky ☀️', 1: 'Mostly clear 🌤', 2: 'Partly cloudy ⛅', 3: 'Overcast ☁️',
  45: 'Foggy 🌫', 48: 'Icy fog 🌫', 
  51: 'Light drizzle 🌦', 53: 'Moderate drizzle 🌦', 55: 'Dense drizzle 🌦',
  61: 'Light rain 🌧', 63: 'Moderate rain 🌧', 65: 'Heavy rain 🌧',
  66: 'Light freezing rain 🌧', 67: 'Heavy freezing rain 🌧',
  71: 'Light snow 🌨', 73: 'Moderate snow 🌨', 75: 'Heavy snow ❄️',
  77: 'Snow grains 🌨',
  80: 'Light showers 🌦', 81: 'Moderate showers 🌦', 82: 'Heavy showers 🌦',
  85: 'Light snow showers 🌨', 86: 'Heavy snow showers 🌨',
  95: 'Thunderstorm ⛈', 96: 'Thunderstorm with hail ⛈', 99: 'Severe thunderstorm with hail ⛈',
};

searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchWeather();
});
unitToggle.addEventListener('change', () => {
    isFahrenheit = !unitToggle.checked;
    displayTemperature();
});

function displayTemperature() {
    if (currentTempC === null) return;
    if (isFahrenheit) {
      const tempF = (currentTempC * 9/5) + 32;
      document.getElementById('temperature').textContent = `🌡 ${tempF.toFixed(1)} °F`;
    } else {
      document.getElementById('temperature').textContent = `🌡 ${currentTempC.toFixed(1)} °C`;
    }
}

async function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  // Hide previous results
  weatherDisplay.classList.add('hidden');
  errorMsg.classList.add('hidden');

  try {
    // Step 1: Turn city name into coordinates
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorMsg.classList.remove('hidden');
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: Fetch weather for those coordinates
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m`
    );
    const weatherData = await weatherRes.json();
    const current = weatherData.current_weather;
    currentTempC = current.temperature;
    const humidity = weatherData.hourly.relative_humidity_2m[0];

    // Step 3: Display the results
    document.getElementById('city-name').textContent = `${name}, ${country}`;
    displayTemperature();
    document.getElementById('condition').textContent =
      weatherDescriptions[current.weathercode] || 'Unknown conditions';
    document.getElementById('wind').textContent =
      `💨 Wind: ${current.windspeed} km/h · 💧 Humidity: ${humidity}%`;

    weatherDisplay.classList.remove('hidden');

  } catch (err) {
    errorMsg.classList.remove('hidden');
    console.error(err);
  }
}