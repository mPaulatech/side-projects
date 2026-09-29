const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const WEATHER = {
  0: { label: "Céu limpo", icon: "sun" },
  1: { label: "Predominantemente limpo", icon: "sun" },
  2: { label: "Parcialmente nublado", icon: "partly" },
  3: { label: "Nublado", icon: "cloud" },
  45: { label: "Nevoeiro", icon: "fog" },
  48: { label: "Nevoeiro com geada", icon: "fog" },
  51: { label: "Garoa fraca", icon: "rain" },
  53: { label: "Garoa", icon: "rain" },
  55: { label: "Garoa intensa", icon: "rain" },
  56: { label: "Garoa congelante", icon: "rain" },
  57: { label: "Garoa congelante intensa", icon: "rain" },
  61: { label: "Chuva fraca", icon: "rain" },
  63: { label: "Chuva", icon: "rain" },
  65: { label: "Chuva forte", icon: "rain" },
  66: { label: "Chuva congelante", icon: "rain" },
  67: { label: "Chuva congelante forte", icon: "rain" },
  71: { label: "Neve fraca", icon: "snow" },
  73: { label: "Neve", icon: "snow" },
  75: { label: "Neve forte", icon: "snow" },
  77: { label: "Grãos de neve", icon: "snow" },
  80: { label: "Pancadas de chuva", icon: "rain" },
  81: { label: "Pancadas de chuva", icon: "rain" },
  82: { label: "Pancadas de chuva fortes", icon: "rain" },
  85: { label: "Pancadas de neve", icon: "snow" },
  86: { label: "Pancadas de neve fortes", icon: "snow" },
  95: { label: "Tempestade", icon: "storm" },
  96: { label: "Tempestade com granizo", icon: "storm" },
  99: { label: "Tempestade com granizo forte", icon: "storm" },
};

const ICONS = {
  sun: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="10" />
      <path d="M32 8v6M32 50v6M8 32h6M50 32h6M14 14l4.2 4.2M45.8 45.8L50 50M50 14l-4.2 4.2M18.2 45.8L14 50" />
    </svg>
  `,
  cloud: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 44h26a10 10 0 0 0 1.2-19.9A14 14 0 0 0 22 22.6 10 10 0 0 0 20 44z" />
    </svg>
  `,
  partly: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="22" r="7" />
      <path d="M24 8v4M8 22h4M12 12l3 3M36 12l-3 3" />
      <path d="M22 46h24a9 9 0 0 0 1-18A13 13 0 0 0 24 25.8 9 9 0 0 0 22 46z" />
    </svg>
  `,
  rain: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 36h24a9 9 0 0 0 1-18A13 13 0 0 0 22 16.8 9 9 0 0 0 20 36z" />
      <path d="M24 44v6M32 44v8M40 44v6" />
    </svg>
  `,
  snow: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 36h24a9 9 0 0 0 1-18A13 13 0 0 0 22 16.8 9 9 0 0 0 20 36z" />
      <path d="M26 44l4 4 4-4M34 44l4 4 4-4" />
    </svg>
  `,
  storm: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 34h24a9 9 0 0 0 1-18A13 13 0 0 0 22 14.8 9 9 0 0 0 20 34z" />
      <path d="M30 36l-6 10h8l-4 10" />
    </svg>
  `,
  fog: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 30h24a9 9 0 0 0 1-18A13 13 0 0 0 22 10.8 9 9 0 0 0 20 30z" />
      <path d="M18 40h28M22 46h20" />
    </svg>
  `,
};

const form = document.querySelector("#search-form");
const input = document.querySelector("#city-input");
const suggestionsEl = document.querySelector("#suggestions");
const statusEl = document.querySelector("#status");
const currentEl = document.querySelector("#current");
const forecastEl = document.querySelector("#forecast");
const forecastGrid = document.querySelector("#forecast-grid");

let debounceTimer;
let activeSuggestion = -1;
let suggestionItems = [];

function weatherInfo(code) {
  return WEATHER[code] || { label: "Condição indefinida", icon: "cloud" };
}

function iconSvg(name) {
  return ICONS[name] || ICONS.cloud;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

async function searchCities(name) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=6&language=pt&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Não foi possível buscar a cidade agora.");
  }
  const data = await response.json();
  return data.results || [];
}

async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "5",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
  });
  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Não foi possível obter a previsão do tempo.");
  }
  return response.json();
}

function placeLabel(place) {
  return [place.admin1, place.country].filter(Boolean).join(", ");
}

function renderSuggestions(places) {
  suggestionItems = places;
  activeSuggestion = -1;
  suggestionsEl.replaceChildren();

  if (!places.length) {
    suggestionsEl.hidden = true;
    return;
  }

  places.forEach((place, index) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.index = index;
    button.textContent = [place.name, placeLabel(place)].filter(Boolean).join(" — ");
    li.append(button);
    suggestionsEl.append(li);
  });

  suggestionsEl.hidden = false;
}

function hideSuggestions() {
  suggestionsEl.hidden = true;
  suggestionItems = [];
  activeSuggestion = -1;
}

function renderCurrent(place, weather) {
  const current = weather.current;
  const info = weatherInfo(current.weather_code);

  document.querySelector("#city-name").textContent = place.name;
  document.querySelector("#country-name").textContent = placeLabel(place);
  document.querySelector("#temperature").textContent = `${Math.round(current.temperature_2m)}°C`;
  document.querySelector("#condition").textContent = info.label;
  document.querySelector("#feels-like").textContent = `Sensação térmica ${Math.round(current.apparent_temperature)}°C`;
  document.querySelector("#humidity").textContent = `${current.relative_humidity_2m}%`;
  document.querySelector("#wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  document.querySelector("#current-icon").innerHTML = iconSvg(info.icon);
  currentEl.hidden = false;
}

function renderForecast(weather) {
  const daily = weather.daily;
  forecastGrid.innerHTML = daily.time
    .map((isoDate, index) => {
      const date = new Date(`${isoDate}T12:00:00`);
      const info = weatherInfo(daily.weather_code[index]);
      const max = Math.round(daily.temperature_2m_max[index]);
      const min = Math.round(daily.temperature_2m_min[index]);

      return `
        <article class="day-card">
          <h4>${WEEKDAYS[date.getDay()]}</h4>
          <div class="icon">${iconSvg(info.icon)}</div>
          <p class="label">${info.label}</p>
          <p class="temps"><span>${max}°</span><span class="min">${min}°</span></p>
        </article>
      `;
    })
    .join("");
  forecastEl.hidden = false;
}

async function loadPlace(place) {
  setStatus("Carregando previsão...");
  hideSuggestions();
  input.value = place.name;

  try {
    const weather = await fetchWeather(place.latitude, place.longitude);
    renderCurrent(place, weather);
    renderForecast(weather);
    setStatus("");
  } catch (error) {
    currentEl.hidden = true;
    forecastEl.hidden = true;
    setStatus(error.message, true);
  }
}

async function handleSearch(query, { auto = false } = {}) {
  const city = query.trim();
  if (!city) {
    setStatus("Digite o nome de uma cidade.", true);
    return;
  }

  setStatus("Buscando cidade...");
  hideSuggestions();
  try {
    const places = await searchCities(city);
    if (!places.length) {
      currentEl.hidden = true;
      forecastEl.hidden = true;
      setStatus("Cidade não encontrada. Tente outro nome.", true);
      return;
    }
    if (places.length === 1 || auto) {
      await loadPlace(places[0]);
      return;
    }
    renderSuggestions(places);
    setStatus("Mais de um resultado. Escolha uma cidade.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(input.value);
});

input.addEventListener("input", () => {
  const value = input.value.trim();
  clearTimeout(debounceTimer);

  if (value.length < 2) {
    hideSuggestions();
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      const places = await searchCities(value);
      renderSuggestions(places);
    } catch {
      hideSuggestions();
    }
  }, 280);
});

suggestionsEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  const place = suggestionItems[Number(button.dataset.index)];
  if (place) loadPlace(place);
});

input.addEventListener("keydown", (event) => {
  const buttons = [...suggestionsEl.querySelectorAll("button")];
  if (!buttons.length || suggestionsEl.hidden) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeSuggestion = (activeSuggestion + 1) % buttons.length;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeSuggestion = (activeSuggestion - 1 + buttons.length) % buttons.length;
  } else if (event.key === "Enter" && activeSuggestion >= 0) {
    event.preventDefault();
    buttons[activeSuggestion].click();
    return;
  } else if (event.key === "Escape") {
    hideSuggestions();
    return;
  } else {
    return;
  }

  buttons.forEach((button, index) => {
    button.classList.toggle("active", index === activeSuggestion);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search")) {
    hideSuggestions();
  }
});

handleSearch("São Paulo", { auto: true });
