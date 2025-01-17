const { app } = require('@azure/functions');
const axios = require('axios');

app.http('WeatherForecastFunction', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // Extract city name from query or request body
        const city =
            request.query.get('city') ||
            (request.method === 'POST' ? JSON.parse(await request.text()).city : null);

        if (!city) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Please provide a city name in the query or request body." }),
                headers: {
                    "Content-Type": "application/json"
                }
            };
        }

        try {
            // Replace with your OpenWeatherMap API key
            const apiKey = "09b0024fa4272154f809f5702fb28961";
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

            // Fetch weather data
            const response = await axios.get(apiUrl);

            // Extract weather details
            const weatherData = response.data;
            const result = {
                city: weatherData.name,
                temperature: weatherData.main.temp,
                description: weatherData.weather[0].description,
                humidity: weatherData.main.humidity,
                wind_speed: weatherData.wind.speed,
            };

            return {
                status: 200,
                body: JSON.stringify(result), // Serialize the object to JSON
                headers: {
                    "Content-Type": "application/json"
                }
            };
        } catch (error) {
            context.log("Error fetching weather data:", error);

            return {
                status: 500,
                body: JSON.stringify({
                    message: "An error occurred while fetching weather data.",
                    error: error.message
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            };
        }
    }
});
