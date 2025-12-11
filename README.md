# Weather App

A modern, responsive weather application built with HTML, CSS, and JavaScript. Get current weather conditions, 5-day forecasts, and hourly predictions for any location worldwide.

## Features

### Core Functionality
- **Current Weather**: Temperature, humidity, wind speed, precipitation, pressure, and visibility
- **5-Day Forecast**: Extended weather predictions with daily highs and lows
- **Hourly Forecast**: Hour-by-hour predictions for the current day
- **Location Search**: Search for weather in any city worldwide
- **Auto-location**: Automatically detect user's current location using geolocation
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### User Experience
- **Clean UI**: Modern, intuitive interface with smooth animations
- **Loading States**: Visual feedback during API requests
- **Error Handling**: Graceful handling of API errors and location access issues
- **Search Suggestions**: Auto-complete suggestions as you type
- **Weather Icons**: Visual weather representations using FontAwesome icons
- **API Caching**: Intelligent caching to reduce API calls and improve performance

### Technical Features
- **OpenWeatherMap Integration**: Reliable weather data from a professional weather service
- **Geolocation API**: Browser-based location detection
- **Responsive Grid Layout**: CSS Grid and Flexbox for perfect layouts on all devices
- **Font Integration**: Google Fonts (Inter) for modern typography
- **Cross-browser Support**: Works on all modern browsers

## Live Demo

The app can be run by opening `index.html` in any modern web browser. However, for full functionality including API calls, you'll need to set up an API key.

## Setup Instructions

### 1. Get an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your dashboard and copy your API key

### 2. Configure the API Key

1. Open `js/api.js`
2. Find the line: `this.apiKey = 'YOUR_API_KEY';`
3. Replace `'YOUR_API_KEY'` with your actual OpenWeatherMap API key

```javascript
// In js/api.js, line ~4
this.apiKey = 'your_actual_api_key_here';
```

### 3. Run the Application

**Option 1: Local File**
- Simply open `index.html` in your web browser
- Note: Some browsers may block API requests from local files due to CORS restrictions

**Option 2: Local Server (Recommended)**
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

**Option 3: Live Server (VS Code Extension)**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

## API Usage

### Current Weather
- Temperature in Celsius
- "Feels like" temperature
- Humidity percentage
- Wind speed in km/h
- Visibility in kilometers
- Atmospheric pressure in hPa
- Precipitation in millimeters

### Weather Icons
The app includes weather icons for various conditions:
- Clear sky (sun/moon)
- Few clouds
- Scattered clouds
- Broken clouds
- Rain (light, moderate, heavy)
- Thunderstorms
- Snow
- Mist/fog

### Location Services
- **Automatic Location**: Uses browser's geolocation API
- **Manual Search**: Type any city name to get weather data
- **Search Suggestions**: Auto-complete with location suggestions
- **Coordinates**: Supports latitude/longitude coordinates

## File Structure

```
weather-app/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styling and responsive design
├── js/
│   ├── api.js          # Weather API service and utilities
│   └── script.js       # Main application logic
└── README.md           # This documentation
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## API Rate Limits

The free OpenWeatherMap plan includes:
- 1,000 calls per day
- 60 calls per minute

The app includes caching to minimize API calls and stay within these limits.

## Customization

### Styling
- Edit `css/style.css` to customize colors, fonts, and layout
- CSS variables are used for easy theme customization
- Responsive breakpoints at 768px and 480px

### Weather Data
- Modify the `WeatherDescriptions` object in `api.js` to customize weather descriptions
- Change icons by updating the `WeatherIcons` mapping
- Adjust units by modifying the API call parameters

### Features
- Add new weather metrics in `displayCurrentWeather()` function
- Extend forecast periods by modifying the forecast display logic
- Add more location search features in the geocoding functions

## Troubleshooting

### Common Issues

**"Invalid API key" Error**
- Ensure you've replaced `'YOUR_API_KEY'` with your actual key
- Check that your OpenWeatherMap account is active
- Verify the API key has the necessary permissions

**Geolocation Not Working**
- Ensure you're serving the app over HTTPS or localhost
- Check browser permissions for location access
- Some browsers block geolocation on file:// URLs

**CORS Errors**
- Use a local server instead of opening the file directly
- Ensure your API key allows requests from your domain

**No Weather Data Showing**
- Check browser console for error messages
- Verify the API key is valid and active
- Ensure internet connectivity

### Debug Mode
Open browser developer tools (F12) to see:
- API request logs
- Cache status
- Error messages
- Network activity

## Performance

### Optimization Features
- **API Caching**: 10-minute cache for weather data
- **Debounced Search**: Prevents excessive API calls during typing
- **Efficient DOM Updates**: Only updates necessary elements
- **Lazy Loading**: Forecast data loads after current weather
- **Responsive Images**: Optimized for different screen sizes

### Monitoring
- Cache hit rates in browser storage
- API call count tracking
- Performance metrics in developer tools

## Contributing

Feel free to contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- Weather data by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [FontAwesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Built with vanilla HTML, CSS, and JavaScript

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all setup steps were followed correctly
4. Verify API key configuration