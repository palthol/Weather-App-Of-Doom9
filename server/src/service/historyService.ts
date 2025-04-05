import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../db/db.json');

// Define a City class with name and id properties
class City {
  name: string;
  id: string;
  
  constructor(name: string) {
    this.name = name;
    this.id = Date.now().toString();
  }
}

// Complete the HistoryService class
class HistoryService {
  // Define a read method that reads from the db.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }
  
  // Define a write method that writes the updated cities array to the db.json file
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(dbPath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing search history:', error);
    }
  }
  
  // Define a getCities method that reads the cities from the db.json file and returns them
  async getCities(): Promise<City[]> {
    return this.read();
  }
  
  // Define an addCity method that adds a city to the db.json file
  async addCity(cityName: string): Promise<City> {
    const cities = await this.read();
    
    // Check if city already exists
    const existingCity = cities.find(city => 
      city.name.toLowerCase() === cityName.toLowerCase());
    
    if (existingCity) {
      return existingCity;
    }
    
    // Add new city
    const newCity = new City(cityName);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }
  
  // Define a removeCity method that removes a city from the db.json file
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const filteredCities = cities.filter(city => city.id !== id);
    
    if (cities.length === filteredCities.length) {
      throw new Error(`City with id ${id} not found`);
    }
    
    await this.write(filteredCities);
  }
}

export default new HistoryService();