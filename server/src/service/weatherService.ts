import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
interface Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

// Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;
  
  constructor() {
    this.baseURL = 'https://api.openweathermap.org/';
    this.apiKey = process.env.WEATHER_API_KEY || '';
  }
  
  private async fetchLocationData(query: string) {
    const geocodeURL = this.buildGeocodeQuery(query);
    const response = await fetch(geocodeURL);
    return response.json();
  }
  
  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error('Location not found');
    }
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    };
  }
  
  private buildGeocodeQuery(query: string): string {
    return `${this.baseURL}geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
  }
  
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }
  
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }
  
  private async fetchWeatherData(coordinates: Coordinates) {
    const weatherURL = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherURL);
    return response.json();
  }
  
  private parseCurrentWeather(response: any, city: string): Weather {
    const currentDate = new Date().toLocaleDateString();
    const current = response.list[0];
    
    return {
      city: city,
      date: currentDate,
      icon: current.weather[0].icon,
      iconDescription: current.weather[0].description,
      tempF: Math.round(current.main.temp),
      windSpeed: current.wind.speed,
      humidity: current.main.humidity
    };
  }
  
  private buildForecastArray(currentWeather: Weather, weatherData: any): Weather[] {
    const forecast: Weather[] = [currentWeather];
    
    // Build 5-day forecast (taking noon readings)
    const uniqueDays = new Set<string>();
    for (const item of weatherData.list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toLocaleDateString();
      
      // Skip current day and ensure we get one forecast per day
      if (dateStr !== currentWeather.date && !uniqueDays.has(dateStr) && uniqueDays.size < 5) {
        uniqueDays.add(dateStr);
        
        forecast.push({
          city: currentWeather.city,
          date: dateStr,
          icon: item.weather[0].icon,
          iconDescription: item.weather[0].description,
          tempF: Math.round(item.main.temp),
          windSpeed: item.wind.speed,
          humidity: item.main.humidity
        });
      }
    }
    
    return forecast;
  }
  
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData, city);
      return this.buildForecastArray(currentWeather, weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}

export default new WeatherService();