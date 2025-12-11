// Main Weather App Script
class WeatherApp {
    constructor() {
        this.api = new WeatherAPI();
        this.currentWeatherData = null;
        this.currentLocation = null;
        
        // Cache DOM elements
        this.elements = this.cacheElements();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize app
        this.init();
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        return {
            // Search elements
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            locationBtn: document.getElementById('locationBtn'),
            
            // Loading and error states
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorText: document.getElementById('errorText'),
            
            // Current weather elements
            currentLocation: document.getElementById('currentLocation'),
            currentDate: document.getElementById('currentDate'),
            currentTemp: document.getElementById('currentTemp'),
            weatherDescription: document.getElementById('weatherDescription'),
            weatherIcon: document.getElementById('weatherIcon'),
            feelsLike: document.getElementById('feelsLike'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            visibility: document.getElementById('visibility'),
            pressure: document.getElementById('pressure'),
            precipitation: document.getElementById('precipitation'),
            lastUpdated: document.getElementById('lastUpdated'),
            
            // Forecast containers
            forecastContainer: document.getElementById('forecastContainer'),
            hourlyContainer: document.getElementById('hourlyContainer'),
            
            // Weather content
            weatherContent: document.getElementById('weatherContent')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Location button
        this.elements.locationBtn.addEventListener('click', () => this.handleLocationRequest());
        
        // Auto-search when user stops typing (debounced)
        let searchTimeout;
        this.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.trim().length >= 3) {
                    this.handleAutoSearch(e.target.value.trim());
                }
            }, 500);
        });

        // Clear search suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.clearSuggestions();
            }
        });
    }

    /**
     * Initialize the app
     */
    async init() {
        // Show loading state
        this.showLoading();
        
        try {
            // Try to get user's location first
            await this.loadUserLocation();
        } catch (error) {
            console.log('Could not get user location:', error);
            // Fallback to a default location (London)
            await this.loadWeatherForCity('London');
        }
    }

    /**
     * Handle search functionality
     */
    async handleSearch() {
        const query = this.elements.searchInput.value.trim();
        if (!query) return;
        
        this.showLoading();
        
        try {
            await this.loadWeatherForCity(query);
            this.elements.searchInput.value = '';
        } catch (error) {
            this.showError('Could not find weather data for this location. Please check the city name and try again.');
        }
    }

    /**
     * Handle location request
     */
    async handleLocationRequest() {
        this.showLoading();
        
        try {
            await this.loadUserLocation();
        } catch (error) {
            let errorMessage = 'Could not get your location. ';
            
            if (error.message.includes('denied')) {
                errorMessage += 'Please allow location access and try again.';
            } else if (error.message.includes('unavailable')) {
                errorMessage += 'Location service is unavailable.';
            } else {
                errorMessage += 'Please try searching for a city instead.';
            }
            
            this.showError(errorMessage);
        }
    }

    /**
     * Load weather for user's current location
     */
    async loadUserLocation() {
        const coords = await this.api.getCurrentPosition();
        const weatherData = await this.api.getWeatherByCoords(coords.latitude, coords.longitude);
        
        this.currentLocation = {
            name: weatherData.locationName,
            coords: coords
        };
        
        this.displayWeather(weatherData);
        this.hideLoading();
    }

    /**
     * Load weather for a specific city
     */
    async loadWeatherForCity(cityName) {
        const weatherData = await this.api.getWeatherByCity(cityName);
        
        this.currentLocation = {
            name: weatherData.locationName,
            searchQuery: cityName
        };
        
        this.displayWeather(weatherData);
        this.hideLoading();
    }

    /**
     * Auto-search suggestions (basic implementation)
     */
    async handleAutoSearch(query) {
        try {
            const suggestions = await this.api.getLocationSuggestions(query);
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.warn('Could not get suggestions:', error);
        }
    }

    /**
     * Display search suggestions
     */
    displaySuggestions(suggestions) {
        this.clearSuggestions();
        
        if (suggestions.length === 0) return;
        
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.style.cssText = `
                padding: 12px 20px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background 0.2s;
            `;
            suggestionElement.textContent = suggestion.displayName;
            
            suggestionElement.addEventListener('mouseenter', () => {
                suggestionElement.style.background = '#f5f5f5';
            });
            
            suggestionElement.addEventListener('mouseleave', () => {
                suggestionElement.style.background = 'white';
            });
            
            suggestionElement.addEventListener('click', async () => {
                this.elements.searchInput.value = suggestion.displayName;
                this.clearSuggestions();
                await this.loadWeatherForCity(suggestion.displayName);
            });
            
            suggestionsContainer.appendChild(suggestionElement);
        });
        
        // Position relative to search container
        const searchContainer = this.elements.searchInput.parentElement;
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(suggestionsContainer);
    }

    /**
     * Clear search suggestions
     */
    clearSuggestions() {
        const suggestions = document.querySelector('.suggestions-container');
        if (suggestions) {
            suggestions.remove();
        }
    }

    /**
     * Display weather data in the UI
     */
    displayWeather(data) {
        this.currentWeatherData = data;
        
        try {
            this.displayCurrentWeather(data.current, data.locationName);
            this.displayForecast(data.forecast);
            this.displayHourlyForecast(data.forecast);
            
            // Add animation classes
            this.elements.weatherContent.classList.add('fade-in');
            
        } catch (error) {
            console.error('Error displaying weather:', error);
            this.showError('Error displaying weather data. Please try again.');
        }
    }

    /**
     * Display current weather data
     */
    displayCurrentWeather(current, locationName) {
        // Location and time
        this.elements.currentLocation.textContent = locationName;
        this.elements.currentDate.textContent = this.formatDateTime(current.dt, current.timezone);
        this.elements.lastUpdated.textContent = 'Updated just now';
        
        // Temperature and description
        this.elements.currentTemp.textContent = Math.round(current.main.temp);
        this.elements.weatherDescription.textContent = current.weather[0].description;
        
        // Weather icon
        const iconClass = WeatherIcons[current.weather[0].icon] || 'fas fa-cloud';
        this.elements.weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
        this.elements.weatherIcon.classList.add('float');
        
        // Weather details
        this.elements.feelsLike.textContent = `${Math.round(current.main.feels_like)}°C`;
        this.elements.humidity.textContent = `${current.main.humidity}%`;
        this.elements.windSpeed.textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
        this.elements.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
        this.elements.pressure.textContent = `${current.main.pressure} hPa`;
        
        // Precipitation (if available)
        const precipitation = current.rain ? current.rain['1h'] || current.rain['3h'] : 0;
        const snow = current.snow ? current.snow['1h'] || current.snow['3h'] : 0;
        const totalPrecipitation = precipitation + snow;
        this.elements.precipitation.textContent = `${totalPrecipitation.toFixed(1)} mm`;
    }

    /**
     * Display 5-day forecast
     */
    displayForecast(forecastData) {
        this.elements.forecastContainer.innerHTML = '';
        
        // Group forecast by day (skip today)
        const dailyForecasts = this.groupForecastByDay(forecastData.list, true);
        
        dailyForecasts.slice(0, 5).forEach(dayData => {
            const forecastItem = this.createForecastItem(dayData);
            this.elements.forecastContainer.appendChild(forecastItem);
        });
    }

    /**
     * Display hourly forecast for today
     */
    displayHourlyForecast(forecastData) {
        this.elements.hourlyContainer.innerHTML = '';
        
        // Get today's forecast
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];
        
        const todayForecasts = forecastData.list
            .filter(item => item.dt_txt.startsWith(todayDate))
            .slice(0, 8); // Show next 8 hours
        
        todayForecasts.forEach(hourlyData => {
            const hourlyItem = this.createHourlyItem(hourlyData);
            this.elements.hourlyContainer.appendChild(hourlyItem);
        });
    }

    /**
     * Create a forecast item element
     */
    createForecastItem(dayData) {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        
        const date = new Date(dayData.date);
        const dayName = this.getDayName(date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const maxTemp = Math.round(Math.max(...dayData.items.map(item => item.main.temp_max)));
        const minTemp = Math.round(Math.min(...dayData.items.map(item => item.main.temp_min)));
        
        // Use the weather from the middle of the day
        const middleItem = dayData.items[Math.floor(dayData.items.length / 2)];
        const iconClass = WeatherIcons[middleItem.weather[0].icon] || 'fas fa-cloud';
        
        item.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="forecast-temp">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
            <div class="forecast-desc">${middleItem.weather[0].description}</div>
        `;
        
        return item;
    }

    /**
     * Create an hourly item element
     */
    createHourlyItem(hourlyData) {
        const item = document.createElement('div');
        item.className = 'hourly-item';
        
        const time = new Date(hourlyData.dt * 1000);
        const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const temp = Math.round(hourlyData.main.temp);
        const iconClass = WeatherIcons[hourlyData.weather[0].icon] || 'fas fa-cloud';
        
        item.innerHTML = `
            <div class="hourly-time">${timeStr}</div>
            <div class="hourly-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="hourly-temp">${temp}°</div>
        `;
        
        return item;
    }

    /**
     * Group forecast data by day
     */
    groupForecastByDay(forecastList, skipToday = false) {
        const grouped = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            // Skip today if requested
            if (skipToday) {
                const today = new Date().toISOString().split('T')[0];
                if (dateKey === today) return;
            }
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: dateKey,
                    items: []
                };
            }
            
            grouped[dateKey].items.push(item);
        });
        
        return Object.values(grouped);
    }

    /**
     * Utility function to format date and time
     */
    formatDateTime(timestamp, timezoneOffset = 0) {
        const date = new Date((timestamp + timezoneOffset) * 1000);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    /**
     * Get day name from date
     */
    getDayName(date) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.error.classList.add('hidden');
        this.elements.weatherContent.classList.add('hidden');
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.elements.loading.classList.add('hidden');
        this.elements.weatherContent.classList.remove('hidden');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.error.classList.remove('hidden');
        this.elements.weatherContent.classList.remove('hidden');
        this.elements.loading.classList.add('hidden');
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.elements.error.classList.add('hidden');
        }, 5000);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherApp;
}