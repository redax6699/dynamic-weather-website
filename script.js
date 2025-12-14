const API_KEY = "be7e823e3e8bc54ee185434db33dc3cb"
let map, marker
const L = window.L

let isCelsius = true
let currentWeatherData = null
let currentTimezone = 0

const weatherThemes = {
  Clear: {
    gradient: "linear-gradient(135deg, #5B9FED 0%, #4A90E2 100%)",
    name: "Sunny",
    textColor: "white",
  },
  Clouds: {
    gradient: "linear-gradient(135deg, #7F8C9A 0%, #5F6B7A 100%)",
    name: "Cloudy",
    textColor: "white",
  },
  Rain: {
    gradient: "linear-gradient(135deg, #4A5F7A 0%, #2C3E50 100%)",
    name: "Rainy",
    textColor: "white",
  },
  Drizzle: {
    gradient: "linear-gradient(135deg, #6C7A89 0%, #434F5E 100%)",
    name: "Drizzle",
    textColor: "white",
  },
  Thunderstorm: {
    gradient: "linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)",
    name: "Stormy",
    textColor: "white",
  },
  Snow: {
    gradient: "linear-gradient(135deg, #B8C6DB 0%, #E0E7EE 100%)",
    name: "Snowy",
    textColor: "#1A252F",
  },
  Mist: {
    gradient: "linear-gradient(135deg, #93A5B1 0%, #6B7C8C 100%)",
    name: "Misty",
    textColor: "white",
  },
  Fog: {
    gradient: "linear-gradient(135deg, #93A5B1 0%, #6B7C8C 100%)",
    name: "Foggy",
    textColor: "white",
  },
  Haze: {
    gradient: "linear-gradient(135deg, #A8B4C0 0%, #7B8794 100%)",
    name: "Hazy",
    textColor: "#1A252F",
  },
}

let currentTheme = weatherThemes["Clear"]

let currentAudio = null
let isMusicPlaying = false

const weatherSounds = {
  Clear: "mixkit-little-birds-singing-in-the-trees-17 (1).wav",
  Clouds: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
  Rain: "https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3",
  Drizzle: "https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3",
  Thunderstorm: "https://assets.mixkit.co/active_storage/sfx/2398/2398-preview.mp3",
  Snow: "https://assets.mixkit.co/active_storage/sfx/2369/2369-preview.mp3",
  Mist: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
  Fog: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
  Haze: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
}

const canvas = document.getElementById("weatherCanvas")
const ctx = canvas.getContext("2d")
let particles = []
let currentWeatherType = "Clear"

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

class Particle {
  constructor(type) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height - canvas.height
    this.type = type

    if (type === "rain") {
      this.speed = Math.random() * 10 + 10
      this.length = Math.random() * 20 + 10
      this.opacity = Math.random() * 0.5 + 0.3
    } else if (type === "snow") {
      this.speed = Math.random() * 2 + 1
      this.radius = Math.random() * 3 + 2
      this.opacity = Math.random() * 0.6 + 0.4
      this.drift = Math.random() * 2 - 1
    } else if (type === "sun") {
      this.x = canvas.width / 2
      this.y = canvas.height / 4
      this.angle = Math.random() * Math.PI * 2
      this.length = Math.random() * 100 + 50
      this.speed = Math.random() * 0.02 + 0.01
      this.opacity = Math.random() * 0.3 + 0.2
    }
  }

  update() {
    if (this.type === "rain") {
      this.y += this.speed
      if (this.y > canvas.height) {
        this.y = -this.length
        this.x = Math.random() * canvas.width
      }
    } else if (this.type === "snow") {
      this.y += this.speed
      this.x += this.drift
      if (this.y > canvas.height) {
        this.y = -this.radius
        this.x = Math.random() * canvas.width
      }
      if (this.x > canvas.width || this.x < 0) {
        this.x = Math.random() * canvas.width
      }
    } else if (this.type === "sun") {
      this.angle += this.speed
    }
  }

  draw() {
    ctx.globalAlpha = this.opacity
    if (this.type === "rain") {
      ctx.strokeStyle = "rgba(174, 194, 224, 0.8)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x, this.y + this.length)
      ctx.stroke()
    } else if (this.type === "snow") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
    } else if (this.type === "sun") {
      ctx.strokeStyle = "rgba(255, 223, 120, 0.4)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      const endX = this.x + Math.cos(this.angle) * this.length
      const endY = this.y + Math.sin(this.angle) * this.length
      ctx.lineTo(endX, endY)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
}

function createParticles(type, count) {
  particles = []
  if (type === "rain" || type === "snow" || type === "sun") {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(type))
    }
  }
}

function animateWeather() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach((particle) => {
    particle.update()
    particle.draw()
  })

  requestAnimationFrame(animateWeather)
}

animateWeather()

function updateWeatherAnimation(weatherMain) {
  currentWeatherType = weatherMain

  if (weatherMain === "Rain") {
    createParticles("rain", 150)
  } else if (weatherMain === "Drizzle") {
    createParticles("rain", 80)
  } else if (weatherMain === "Snow") {
    createParticles("snow", 100)
  } else if (weatherMain === "Clear") {
    createParticles("sun", 12)
  } else {
    particles = []
  }
}

function playWeatherMusic(weatherMain) {
  const soundUrl = weatherSounds[weatherMain] || weatherSounds["Clear"]

  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  if (isMusicPlaying) {
    currentAudio = new Audio(soundUrl)
    currentAudio.loop = true
    currentAudio.volume = 0.3
    currentAudio.play().catch((error) => console.log("Audio playback failed:", error))
  }
}

function toggleMusic() {
  isMusicPlaying = !isMusicPlaying
  const musicIcon = document.getElementById("musicIcon")

  if (isMusicPlaying) {
    musicIcon.innerHTML =
      '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>'
    playWeatherMusic(Object.keys(weatherThemes).find((key) => weatherThemes[key] === currentTheme) || "Clear")
  } else {
    musicIcon.innerHTML =
      '<path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2z"/>'
    if (currentAudio) {
      currentAudio.pause()
    }
  }
}

document.getElementById("musicToggle").addEventListener("click", toggleMusic)

function adjustThemeForTime(theme, sunriseTime, sunsetTime, currentTime) {
  const hour = new Date(currentTime * 1000).getUTCHours()
  const sunriseHour = new Date(sunriseTime * 1000).getUTCHours()
  const sunsetHour = new Date(sunsetTime * 1000).getUTCHours()

  const isNightTime = hour < sunriseHour || hour > sunsetHour

  if (isNightTime) {
    const darkerGradient = theme.gradient.replace(/\d+%/g, (match) => {
      const value = Number.parseInt(match)
      return Math.max(0, value - 30) + "%"
    })
    return { ...theme, gradient: darkerGradient }
  }

  return theme
}

function updateTheme(weatherMain, sunrise, sunset, currentTime) {
  let theme = weatherThemes[weatherMain] || weatherThemes["Clear"]
  theme = adjustThemeForTime(theme, sunrise, sunset, currentTime)
  currentTheme = theme
  document.body.style.background = theme.gradient

  const textElements = document.querySelectorAll(
    ".text-white, .text-white\\/90, .text-white\\/80, .text-white\\/70, .text-white\\/60",
  )
  textElements.forEach((el) => {
    if (theme.textColor === "white") {
      el.style.color = ""
    } else {
      el.style.color = theme.textColor
    }
  })

  playWeatherMusic(weatherMain)
  updateWeatherAnimation(weatherMain)
}

function initMap(lat, lon, cityName) {
  if (!map) {
    map = L.map("map").setView([lat, lon], 13)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)
    marker = L.marker([lat, lon]).addTo(map)
  } else {
    map.setView([lat, lon], 13)
    marker.setLatLng([lat, lon])
  }
  marker.bindPopup(`<b>${cityName}</b>`).openPopup()
}

function getWeatherIcon(weatherMain) {
  const icons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️",
  }
  return icons[weatherMain] || "☀️"
}

function formatTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes} ${ampm}`
}

function getDayName(dateStr) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const date = new Date(dateStr)
  return days[date.getDay()]
}

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32
}

function formatTemperature(temp) {
  if (isCelsius) {
    return `${Math.round(temp)}°`
  } else {
    return `${Math.round(celsiusToFahrenheit(temp))}°`
  }
}

function updateLocalTime() {
  if (currentTimezone) {
    const now = Date.now() / 1000
    const localTime = new Date((now + currentTimezone) * 1000)
    const hours = localTime.getUTCHours().toString().padStart(2, "0")
    const minutes = localTime.getUTCMinutes().toString().padStart(2, "0")
    document.getElementById("localTime").textContent = `${hours}:${minutes}`
  }
}

setInterval(updateLocalTime, 1000)

function loadFavorites() {
  const favorites = localStorage.getItem("weatherFavorites")
  return favorites ? JSON.parse(favorites) : []
}

function saveFavorites(favorites) {
  localStorage.setItem("weatherFavorites", JSON.stringify(favorites))
}

function addFavorite(cityName) {
  const favorites = loadFavorites()
  if (!favorites.includes(cityName) && favorites.length < 5) {
    favorites.push(cityName)
    saveFavorites(favorites)
    updateFavoritesUI()
  }
}

function removeFavorite(cityName) {
  let favorites = loadFavorites()
  favorites = favorites.filter((city) => city !== cityName)
  saveFavorites(favorites)
  updateFavoritesUI()
}

function updateFavoritesUI() {
  const container = document.getElementById("favoritesContainer")
  const favorites = loadFavorites()

  container.innerHTML = favorites
    .map(
      (city) => `
    <div class="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-white text-sm">
      <button onclick="fetchWeather('${city}')" class="hover:underline">${city}</button>
      <button onclick="removeFavorite('${city}')" class="ml-1 hover:scale-110 transition-transform">×</button>
    </div>
  `,
    )
    .join("")
}

document.getElementById("addFavoriteBtn").addEventListener("click", () => {
  if (currentWeatherData) {
    addFavorite(currentWeatherData.name)
  }
})

document.getElementById("shareBtn").addEventListener("click", async () => {
  if (currentWeatherData) {
    const shareData = {
      title: "Weather Update",
      text: `Current weather in ${currentWeatherData.name}: ${Math.round(currentWeatherData.main.temp)}°C, ${currentWeatherData.weather[0].main}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
      alert("Weather info copied to clipboard!")
    }
  }
})

document.getElementById("unitToggle").addEventListener("click", () => {
  isCelsius = !isCelsius
  document.getElementById("unitToggle").textContent = isCelsius ? "°C" : "°F"

  if (currentWeatherData) {
    updateTemperatureDisplay()
  }
})

function updateTemperatureDisplay() {
  document.getElementById("currentTemp").textContent = formatTemperature(currentWeatherData.main.temp)
  document.getElementById("feelsLike").textContent = formatTemperature(currentWeatherData.main.feels_like)

  const forecastContainer = document.getElementById("forecastContainer")
  const forecastItems = forecastContainer.querySelectorAll("[data-temp]")
  forecastItems.forEach((item) => {
    const temp = Number.parseFloat(item.dataset.temp)
    const tempMin = Number.parseFloat(item.dataset.tempMin)
    item.querySelector(".temp-high").textContent = formatTemperature(temp)
    item.querySelector(".temp-low").textContent = formatTemperature(tempMin)
  })
}

document.getElementById("geolocateBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`,
          )
          const data = await response.json()
          document.getElementById("cityInput").value = data.name
          fetchWeather(data.name)
        } catch (error) {
          console.error("Error fetching location weather:", error)
          alert("Error fetching weather for your location")
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Unable to get your location. Please enable location services.")
      },
    )
  } else {
    alert("Geolocation is not supported by your browser")
  }
})

async function fetchWeather(city) {
  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`,
    )
    const currentData = await currentResponse.json()

    if (currentData.cod !== 200) {
      alert("City not found. Please try another city.")
      return
    }

    currentWeatherData = currentData
    currentTimezone = currentData.timezone

    const currentTime = Date.now() / 1000
    updateTheme(currentData.weather[0].main, currentData.sys.sunrise, currentData.sys.sunset, currentTime)

    document.getElementById("locationName").textContent = `${currentData.name}, ${currentData.sys.country}`
    document.getElementById("currentTemp").textContent = formatTemperature(currentData.main.temp)
    document.getElementById("weatherIcon").textContent = getWeatherIcon(currentData.weather[0].main)
    document.getElementById("weatherDesc").textContent = currentData.weather[0].main
    document.getElementById("windSpeed").textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`
    document.getElementById("humidity").textContent = `${currentData.main.humidity}%`
    document.getElementById("feelsLike").textContent = formatTemperature(currentData.main.feels_like)
    document.getElementById("pressure").textContent = `${currentData.main.pressure} hPa`
    document.getElementById("sunrise").textContent = formatTime(currentData.sys.sunrise, currentData.timezone)
    document.getElementById("sunset").textContent = formatTime(currentData.sys.sunset, currentData.timezone)

    updateLocalTime()

    initMap(currentData.coord.lat, currentData.coord.lon, currentData.name)

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`,
    )
    const forecastData = await forecastResponse.json()

    const hourlyContainer = document.getElementById("hourlyContainer")
    hourlyContainer.innerHTML = ""
    const textColor = currentTheme.textColor

    forecastData.list.slice(0, 8).forEach((item) => {
      const time = formatTime(item.dt, currentData.timezone)
      const temp = formatTemperature(item.main.temp)
      const icon = getWeatherIcon(item.weather[0].main)

      hourlyContainer.innerHTML += `
        <div class="flex flex-col items-center gap-2 min-w-20" style="color: ${textColor};">
          <div class="text-sm opacity-70">${time}</div>
          <span class="text-2xl">${icon}</span>
          <div class="font-bold">${temp}</div>
        </div>
      `
    })

    const dailyForecasts = {}
    forecastData.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0]
      if (!dailyForecasts[date] && item.dt_txt.includes("12:00:00")) {
        dailyForecasts[date] = item
      }
    })

    const forecastContainer = document.getElementById("forecastContainer")
    forecastContainer.innerHTML = ""

    Object.entries(dailyForecasts)
      .slice(0, 7)
      .forEach(([date, forecast]) => {
        const dayName = getDayName(date)
        const temp = forecast.main.temp
        const tempMin = forecast.main.temp_min
        const weatherIcon = getWeatherIcon(forecast.weather[0].main)
        const weatherDesc = forecast.weather[0].main

        const textColor = currentTheme.textColor
        const secondaryTextColor = textColor === "white" ? "rgba(255, 255, 255, 0.6)" : "rgba(26, 37, 47, 0.6)"

        forecastContainer.innerHTML += `
                <div class="flex items-center justify-between" style="color: ${textColor};" data-temp="${temp}" data-temp-min="${tempMin}">
                    <div class="w-12 font-semibold">${dayName}</div>
                    <span class="text-2xl">${weatherIcon}</span>
                    <div class="flex-1 text-center text-sm">${weatherDesc}</div>
                    <div class="font-bold temp-high">${formatTemperature(temp)}</div>
                    <div class="ml-2 temp-low" style="color: ${secondaryTextColor};">${formatTemperature(tempMin)}</div>
                </div>
            `
      })

    if (Object.keys(dailyForecasts).length > 0) {
      const firstForecast = Object.values(dailyForecasts)[0]
      document.getElementById("tempRange").textContent =
        `High: ${formatTemperature(firstForecast.main.temp_max)} Low: ${formatTemperature(firstForecast.main.temp_min)}`
    }
  } catch (error) {
    console.error("Error fetching weather:", error)
    alert("Error fetching weather data. Please try again.")
  }
}

const cityInput = document.getElementById("cityInput")
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim()
    if (city) {
      fetchWeather(city)
    }
  }
})

updateFavoritesUI()

fetchWeather("Dakhla")
