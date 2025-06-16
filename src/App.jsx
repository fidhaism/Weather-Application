import React, { useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFrown, faSyncAlt, faWind, faTint } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import ChatBot from "./ChatBot";

function WeatherApp() {
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState({ loading: false, data: {}, error: false });
  const [suggestions, setSuggestions] = useState([]);
  const [reset, setReset] = useState(false);

  const toDateFunction = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const weekDays = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    const currentDate = new Date();
    return `${weekDays[currentDate.getDay()]}, ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const api_key = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${api_key}`;
    try {
      const res = await axios.get(url);
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    }
  };

  const fetchWeather = async (city) => {
    setWeather({ ...weather, loading: true, error: false });
    const api_key = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    try {
      const res = await axios.get(url, {
        params: { q: city, units: "metric", appid: api_key }
      });
      setWeather({ data: res.data, loading: false, error: false });
      setReset(false);
    } catch {
      setWeather({ data: {}, loading: false, error: true });
    }
  };

  const search = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (input.trim()) {
        fetchWeather(input);
        setInput("");
        setSuggestions([]);
      }
    }
  };

  const refreshWeather = () => {
    setWeather({ loading: false, data: {}, error: false });
    setInput("");
    setSuggestions([]);
    setReset(true);
  };

  return (
    <div className="app-bg d-flex align-items-center justify-content-center min-vh-100">
      <div className="card glass-card fade-in">
        <h1 className="mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Weather App</h1>
        <div className="input-group mb-3" style={{ position: "relative" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter city name..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              fetchSuggestions(e.target.value);
              setReset(false);
            }}
            onKeyDown={search}
          />
          <button
            className="input-group-text bg-primary text-white"
            onClick={() => {
              if (input.trim()) {
                fetchWeather(input);
                setInput("");
                setSuggestions([]);
              }
            }}
            style={{ border: "none", cursor: "pointer" }}
            type="button"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
          {suggestions.length > 0 && (
            <ul
              className="list-group"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                zIndex: 10,
                maxHeight: "200px",
                overflowY: "auto",
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
            >
              {suggestions.map((city, idx) => (
                <li
                  key={idx}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setInput(`${city.name}${city.state ? ", " + city.state : ""}, ${city.country}`);
                    setSuggestions([]);
                    fetchWeather(`${city.name}${city.state ? ", " + city.state : ""}, ${city.country}`);
                  }}
                >
                  {city.name}{city.state ? ", " + city.state : ""}, {city.country}
                </li>
              ))}
            </ul>
          )}
        </div>
        {weather.loading && <ClipLoader color="#667eea" size={50} />}
        {weather.error && <p className="text-danger mt-3"><FontAwesomeIcon icon={faFrown} /> City not found</p>}
        {!reset && weather.data.main && (
          <div className="mt-3 fade-in">
            <div className="d-flex align-items-center justify-content-center mb-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@4x.png`}
                alt={weather.data.weather[0].description}
                style={{ width: "100px" }}
              />
              <div>
                <p className="fs-1 fw-bold mb-0">{Math.round(weather.data.main.temp)}<sup>°C</sup></p>
                <p className="text-uppercase fw-semibold">{weather.data.weather[0].description}</p>
              </div>
            </div>
            <h2 className="fw-bold text-center">{weather.data.name}, {weather.data.sys.country}</h2>
            <p className="text-muted mt-3 text-center">{toDateFunction()}</p>
            <div className="weather-details">
              <div className="weather-detail-card">
                <FontAwesomeIcon icon={faWind} size="lg" />
                <div>{weather.data.wind.speed} m/s</div>
                <small>Wind</small>
              </div>
              <div className="weather-detail-card">
                <FontAwesomeIcon icon={faTint} size="lg" />
                <div>{weather.data.main.humidity}%</div>
                <small>Humidity</small>
              </div>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <button className="btn btn-secondary" onClick={refreshWeather}>
                <FontAwesomeIcon icon={faSyncAlt} /> Refresh
              </button>
            </div>
            
          </div>
        )}
      </div>
      <ChatBot />
    </div>
  );
}

export default WeatherApp;