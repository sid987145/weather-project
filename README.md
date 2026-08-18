# Global City Insights Dashboard 🌍

A modern, high-performance real-time dashboard for tracking global cities, live weather, air quality indices (AQI), 5-day weather forecasts, population demographics, and foreign exchange rates. Built with **Next.js (App Router)**, **React 19**, **Tailwind CSS**, **Leaflet**, and **MongoDB**.

---

## ✨ Features

- 🗺️ **Interactive Global Map**: Visualizes tracked cities worldwide using Leaflet with color-coded temperature and AQI pin markers, smooth fly-to animations, and interactive tooltips.
- 🌤️ **Live Weather & Air Quality**: Real-time atmospheric metrics powered by OpenWeather API (temperature, feels-like, humidity, wind speed, PM2.5, PM10, NO₂, O₃, CO, and US/European AQI).
- 📅 **5-Day Weather Forecasts**: Detailed daily forecast projections with dynamic weather condition icons and high/low temperature metrics.
- 📈 **Historical Trends & Analytics**: Temperature and AQI trend charts powered by Recharts with multi-axis support.
- 🔍 **Global City Search & Tracking**: Autocomplete search via GeoDB RapidAPI with one-click city tracking and dynamic MongoDB persistence.
- 🔐 **Authentication & Security**: Secure user signup, login, JWT token authentication, and bcrypt password hashing.
- 🌗 **Dark Mode & Light Mode**: Built-in responsive theme switching with automatic system preference detection.
- ⚡ **Optimized Next.js 16 + React 19 Engine**: Server-rendered API routes, connection pooling, zero lint warnings, and high-performance Turbopack build support.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React icons
- **Data Visualizations**: Leaflet, React-Leaflet, Recharts
- **Database & ODM**: MongoDB Atlas, Mongoose
- **APIs**: OpenWeatherMap API, GeoDB Cities (RapidAPI), ExchangeRate-API

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd global-city-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and configure your API keys:
```bash
cp .env.example .env.local
```

Fill in the environment variables:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/global-city-auth?appName=Cluster0

# Authentication
JWT_SECRET=your_jwt_secret_key

# OpenWeather API (https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_openweather_api_key

# GeoDB RapidAPI (https://rapidapi.com/wirefreethought/api/geodb-cities)
GEODB_API_KEY=your_geodb_rapidapi_key
GEODB_API_HOST=wft-geo-db.p.rapidapi.com

# Exchange Rate API (https://www.exchangerate-api.com/)
EXCHANGE_RATE_API_KEY=your_exchange_rate_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Scripts

- `npm run dev` - Start local development server with hot-reloading
- `npm run lint` - Run ESLint checks across all components and API routes
- `npm run build` - Create optimized production bundle
- `npm run start` - Run production server

---

## 🚢 Deployment

Easily deploy to [Vercel](https://vercel.com) or any Node.js hosting platform:
1. Push your code to your GitHub repository.
2. Import your repository on Vercel.
3. Configure the environment variables in your Vercel Project Settings.
4. Deploy!

