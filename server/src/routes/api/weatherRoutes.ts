import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  try {
    const { cityName } = req.body;
    
    if (!cityName) {
      return res.status(400).json({ message: 'City name is required' });
    }
    
    // Get weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    
    // Save city to search history
    await HistoryService.addCity(cityName);
    
    return res.json(weatherData);
  } catch (error: any) {
    console.error('Error processing weather request:', error);
    return res.status(500).json({ message: error.message || 'An error occurred' });
  }
});

// GET search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    return res.json(cities);
  } catch (error: any) {
    console.error('Error getting search history:', error);
    return res.status(500).json({ message: error.message || 'An error occurred' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    return res.status(200).json({ message: 'City removed from history' });
  } catch (error: any) {
    console.error('Error deleting city from history:', error);
    return res.status(500).json({ message: error.message || 'An error occurred' });
  }
});

export default router;