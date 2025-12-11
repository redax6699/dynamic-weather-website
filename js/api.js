// Weather API Service
class WeatherAPI {
    constructor() {
        // Demo API key for testing - replace with your own for production
        // Get your free API key at: https://openweathermap.org/api
        this.apiKey = 'b6907d289e10d714a6e88b30761fae22'; // Demo key with limited functionality
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.geoUrl = 'https://api.openweathermap.org/geo/1.0';
        
        // Check if using demo key
        this.isDemoKey = this.apiKey === 'b6907d289e10d714a6e88b30761fae22';
        
        // Cache for API calls to avoid excessive requests
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    /**
     * Make API request with error handling and caching
     */
    async makeRequest(url, cacheKey = null) {
        // Show warning if using demo key
        if (this.isDemoKey) {
            console.warn('Using demo API key. Please get your own free key at https://openweathermap.org/api for full functionality.');
        }

        // Check cache first
        if (cacheKey && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 401) {
                    if (this.isDemoKey) {
                        throw new Error('Demo API key limit reached. Please get your own free API key at https://openweathermap.org/api');
                    }
                    throw new Error('Invalid API key');
                } else if (response.status === 404) {
                    throw new Error('Location not found');
                } else {
                    throw new Error(`API request failed: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            // Cache the response
            if (cacheKey) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Get weather by city name
     */
    async getWeatherByCity(cityName) {
        const cacheKey = `weather_${cityName}`;
        
        // Current weather
        const currentUrl = `${this.baseUrl}/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`;
        const currentData = await this.makeRequest(currentUrl, cacheKey);
        
        // 5-day forecast
        const forecastUrl = `${this.baseUrl}/forecast?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`;
        const forecastData = await this.makeRequest(forecastUrl, `${cacheKey}_forecast`);
        
        // Reverse geocoding for better location name
        const geoUrl = `${this.geoUrl}/reverse?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&limit=1&appid=${this.apiKey}`;
        let locationName = cityName;
        
        try {
            const geoData = await this.makeRequest(geoUrl, `geo_${currentData.coord.lat}_${currentData.coord.lon}`);
            if (geoData && geoData.length > 0) {
                const location = geoData[0];
                locationName = `${location.name}, ${location.country}`;
            }
        } catch (error) {
            console.warn('Could not get location name:', error);
        }
        
        return {
            current: currentData,
            forecast: forecastData,
            locationName: locationName
        };
    }

    /**
     * Get weather by coordinates
     */
    async getWeatherByCoords(lat, lon) {
        const cacheKey = `weather_${lat}_${lon}`;
        
        // Current weather
        const currentUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        const currentData = await this.makeRequest(currentUrl, cacheKey);
        
        // 5-day forecast
        const forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        const forecastData = await this.makeRequest(forecastUrl, `${cacheKey}_forecast`);
        
        // Reverse geocoding for better location name
        const geoUrl = `${this.geoUrl}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`;
        let locationName = `${currentData.name}, ${currentData.sys.country}`;
        
        try {
            const geoData = await this.makeRequest(geoUrl, `geo_${lat}_${lon}`);
            if (geoData && geoData.length > 0) {
                const location = geoData[0];
                locationName = `${location.name}, ${location.country}`;
            }
        } catch (error) {
            console.warn('Could not get location name:', error);
        }
        
        return {
            current: currentData,
            forecast: forecastData,
            locationName: locationName
        };
    }

    /**
     * Get location suggestions for search
     */
    async getLocationSuggestions(query) {
        if (query.length < 2) return [];
        
        try {
            const url = `${this.geoUrl}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`;
            const data = await this.makeRequest(url, `suggestions_${query}`);
            return data.map(location => ({
                name: location.name,
                country: location.country,
                state: location.state,
                lat: location.lat,
                lon: location.lon,
                displayName: location.state ? 
                    `${location.name}, ${location.state}, ${location.country}` :
                    `${location.name}, ${location.country}`
            }));
        } catch (error) {
            console.error('Error getting location suggestions:', error);
            return [];
        }
    }

    /**
     * Get user's current location using browser geolocation
     */
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            reject(new Error('Location access denied by user'));
                            break;
                        case error.POSITION_UNAVAILABLE:
                            reject(new Error('Location information unavailable'));
                            break;
                        case error.TIMEOUT:
                            reject(new Error('Location request timed out'));
                            break;
                        default:
                            reject(new Error('An unknown error occurred'));
                            break;
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache status for debugging
     */
    getCacheStatus() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
            hasExpiredEntries: Array.from(this.cache.entries())
                .some(([_, value]) => Date.now() - value.timestamp >= this.cacheTimeout)
        };
    }
}

// Weather icon mapping
const WeatherIcons = {
    // OpenWeatherMap icon codes to FontAwesome icons
    '01d': 'fas fa-sun', // clear sky day
    '01n': 'fas fa-moon', // clear sky night
    '02d': 'fas fa-cloud-sun', // few clouds day
    '02n': 'fas fa-cloud-moon', // few clouds night
    '03d': 'fas fa-cloud', // scattered clouds
    '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud', // broken clouds
    '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-rain', // shower rain
    '09n': 'fas fa-cloud-rain',
    '10d': 'fas fa-cloud-sun-rain', // rain day
    '10n': 'fas fa-cloud-moon-rain', // rain night
    '11d': 'fas fa-bolt', // thunderstorm
    '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake', // snow
    '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog', // mist
    '50n': 'fas fa-smog'
};

// Weather condition descriptions
const WeatherDescriptions = {
    'clear sky': 'Clear and sunny',
    'few clouds': 'Partly cloudy',
    'scattered clouds': 'Scattered clouds',
    'broken clouds': 'Cloudy',
    'overcast clouds': 'Overcast',
    'light rain': 'Light rain',
    'moderate rain': 'Rain',
    'heavy intensity rain': 'Heavy rain',
    'very heavy rain': 'Very heavy rain',
    'extreme rain': 'Extreme rain',
    'freezing rain': 'Freezing rain',
    'light intensity shower rain': 'Light shower',
    'heavy intensity shower rain': 'Heavy shower',
    'ragged shower rain': 'Ragged shower',
    'light snow': 'Light snow',
    'snow': 'Snow',
    'heavy snow': 'Heavy snow',
    'sleet': 'Sleet',
    'light shower sleet': 'Light sleet',
    'heavy shower sleet': 'Heavy sleet',
    'mist': 'Misty',
    'smoke': 'Smoky',
    'haze': 'Hazy',
    'dust': 'Dusty',
    'fog': 'Foggy',
    'sand': 'Sandy',
    'ash': 'Ash',
    'squall': 'Squall',
    'tornado': 'Tornado',
    'thunderstorm': 'Thunderstorm',
    'thunderstorm with light rain': 'Storm with light rain',
    'thunderstorm with rain': 'Storm with rain',
    'thunderstorm with heavy rain': 'Severe storm',
    'thunderstorm with light drizzle': 'Storm with drizzle',
    'thunderstorm with drizzle': 'Storm with drizzle',
    'thunderstorm with heavy drizzle': 'Severe storm'
};

// Export for use in main script
window.WeatherAPI = WeatherAPI;
window.WeatherIcons = WeatherIcons;
window.WeatherDescriptions = WeatherDescriptions;