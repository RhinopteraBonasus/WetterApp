import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_KEY = '7cc5a9a8bb7e16cf68f2e9f35a2c7b88';

const App = () => {
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);

        if (!map) {
          const newMap = L.map('mapid').setView([position.coords.latitude, position.coords.longitude], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18,
          }).addTo(newMap);
          L.marker([position.coords.latitude, position.coords.longitude]).addTo(newMap);
          setMap(newMap);
        } else {
          map.setView([position.coords.latitude, position.coords.longitude], 13);
        }
      });
    }
  }, [map]);

  useEffect(() => {
    if (lat && long) {
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${API_KEY}`)
        .then(res => {
          setCurrentTemp(res.data.main.temp);
          setHumidity(res.data.main.humidity);
          setWindSpeed(res.data.wind.speed);
          setUvIndex(res.data.uvi);
        });

      axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=current,minutely,hourly,alerts&units=metric&appid=${API_KEY}`)
        .then(res => {
          setDailyForecast(res.data.daily);
        });
    }
  }, [lat, long]);

  const handleSearch = (e) => {
    e.preventDefault();
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&units=metric&appid=${API_KEY}`)
      .then(res => {
        setSearchResults([res.data]);

        if (!map) {
          const newMap = L.map('mapid').setView([res.data.coord.lat, res.data.coord.lon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18,
          }).addTo(newMap);
          L.marker([res.data.coord.lat, res.data.coord.lon]).addTo(newMap);
          setMap(newMap);
        } else {
          map.setView([res.data.coord.lat, res.data.coord.lon], 13);
          L.marker([res.data.coord.lat, res.data.coord.lon]).addTo(map);
        }
      });
  }

  return (
    <div>
      <h1>Weather App</h1>

      <div>
        <h2>Current Weather</h2>
        {currentTemp ? (
          <div>
            <p>Temperature: {currentTemp}°C</p>
            <p>Humidity: {humidity}%</p>
            <p>Wind Speed: {windSpeed} m/s</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div>
        <h2>Search by Location</h2>
        <form onSubmit={handleSearch}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        {searchResults.length > 0 ? (
          <div>
            {searchResults.map((result, index) => (
              <div key={index}>
                <p>{result.name}, {result.sys.country}</p>
                <p>Temperature: {result.main.temp}°C</p>
                <p>Humidity: {result.main.humidity}%</p>
                <p>Wind Speed: {result.wind.speed} m/s</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No search results.</p>
        )}
      </div>

      <div id="mapid" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
}

export default App;