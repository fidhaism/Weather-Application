import React, { useState } from "react";
import axios from "axios";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your weather assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);

  // Helper to fetch weather for a city
  const fetchWeatherForCity = async (city) => {
    const api_key = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    try {
      const res = await axios.get(url, {
        params: { q: city, units: "metric", appid: api_key }
      });
      const data = res.data;
      return `The weather in ${data.name}, ${data.sys.country} is ${Math.round(data.main.temp)}°C with ${data.weather[0].description}.`;
    } catch {
      return `Sorry, I couldn't find the weather for "${city}".`;
    }
  };

  // Detect if user is asking for weather in a city
  const parseWeatherQuery = (msg) => {
    // Example matches: "weather in Paris", "what is the weather in New York"
    const regex = /weather (?:in|of|at)\s+([a-zA-Z\s]+)/i;
    const match = msg.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  };

  const getBotReply = async (message) => {
    const city = parseWeatherQuery(message);
    if (city) {
      return await fetchWeatherForCity(city);
    }
    // fallback responses
    const msg = message.toLowerCase();
    if (msg.includes("hello")) return "Hello! How can I help you with the weather?";
    if (msg.includes("weather")) return "Type a city name above or ask me about the weather in a city!";
    if (msg.includes("help")) return "You can ask about the weather, e.g., 'What is the weather in Paris?'";
    return "Sorry, I didn't understand. Try asking about the weather in a city!";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    const reply = await getBotReply(input);
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { from: "bot", text: reply }]);
    }, 500);
    setInput("");
  };

  if (!visible) {
    return (
      <button
        className="chatbot-reopen-btn"
        onClick={() => setVisible(true)}
        title="Open Chatbot"
      >
        💬
      </button>
    );
  }

  return (
    <div className={`chatbot-container${minimized ? " minimized" : ""}`}>
      <div className="chatbot-header">
        <span>Weather ChatBot</span>
        <div>
          <button
            className="chatbot-header-btn"
            onClick={() => setMinimized((m) => !m)}
            title={minimized ? "Maximize" : "Minimize"}
          >
            {minimized ? "🔼" : "🔽"}
          </button>
          <button
            className="chatbot-header-btn"
            onClick={() => setVisible(false)}
            title="Close"
          >
            ✖
          </button>
        </div>
      </div>
      {!minimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-msg ${msg.from}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me something..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}