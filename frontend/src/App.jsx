import React, { useState, useEffect, useMemo } from 'react'
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import MainContent from './components/MainContent'
import StormEffect from './components/StormEffect'
import SnowEffect from './components/SnowEffect'

// Comprehensive weather backgrounds - season, time, and weather aware
const backgrounds = {
  // Summer day backgrounds
  clear_summer_day: 'https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&w=1920', // Bright blue sky with sun
  partlyCloudy_summer_day: 'https://images.pexels.com/photos/2114014/pexels-photo-2114014.jpeg?auto=compress&cs=tinysrgb&w=1920', // Blue sky with fluffy white clouds
  
  // Winter day backgrounds
  clear_winter_day: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920', // Crisp winter blue sky
  partlyCloudy_winter_day: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=1920', // Winter clouds
  
  // Night backgrounds - Northern/Cold regions (mountains, snow)
  clear_night_north: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', // Starry night with snowy mountains
  partlyCloudy_night_north: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80', // Moody cloudy night
  
  // Night backgrounds - Southern/Warm regions (tropical, ocean)
  clear_night_south: 'https://images.unsplash.com/photo-1536746803623-cef87080bfc8?w=1920&q=80', // Tropical night sky over ocean/palm trees
  partlyCloudy_night_south: 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=1920&q=80', // Warm night with clouds
  
  // Weather conditions (any time)
  overcast: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg?auto=compress&cs=tinysrgb&w=1920', // Grey overcast
  rain: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', // Rain drops
  storm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=80', // Dark storm
  snow: 'https://images.pexels.com/photos/688660/pexels-photo-688660.jpeg?auto=compress&cs=tinysrgb&w=1920', // Snow falling
  
  // Freezing clear (winter specific when temp < 40°F)
  freezing_clear_day: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920', // Cold clear winter day
  freezing_clear_night: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1920', // Cold clear winter night
}

// Determine season based on date and hemisphere
const getSeason = (date, latitude = 40) => {
  const month = date.getMonth() // 0-11
  const isNorthernHemisphere = latitude >= 0
  
  // Northern hemisphere seasons
  if (isNorthernHemisphere) {
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  } else {
    // Southern hemisphere (seasons reversed)
    if (month >= 2 && month <= 4) return 'fall'
    if (month >= 5 && month <= 7) return 'winter'
    if (month >= 8 && month <= 10) return 'spring'
    return 'summer'
  }
}

// Check if it's daytime based on current time and sunrise/sunset
const isDaytime = (sunrise, sunset) => {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  if (sunrise && sunset) {
    const sunriseDate = new Date(sunrise)
    const sunsetDate = new Date(sunset)
    const sunriseMinutes = sunriseDate.getHours() * 60 + sunriseDate.getMinutes()
    const sunsetMinutes = sunsetDate.getHours() * 60 + sunsetDate.getMinutes()
    return currentMinutes >= sunriseMinutes && currentMinutes <= sunsetMinutes
  }
  
  // Default: assume daytime between 6 AM and 6 PM
  return currentMinutes >= 360 && currentMinutes <= 1080
}

const getWeatherType = (condition) => {
  const lower = condition?.toLowerCase() || ''
  if (lower.includes('thunder') || lower.includes('storm')) return 'storm'
  if (lower.includes('snow') || lower.includes('sleet') || lower.includes('ice')) return 'snow'
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) return 'rain'
  if (lower.includes('overcast')) return 'overcast'
  if (lower.includes('partly') || lower.includes('cloud')) return 'partlyCloudy'
  return 'clear'
}

// Get the appropriate background based on weather, season, time, temperature, and location
const getBackground = (weatherType, season, isDay, temperature, latitude) => {
  // Storm, rain, snow, overcast don't change by time/season
  if (weatherType === 'storm') return backgrounds.storm
  if (weatherType === 'rain') return backgrounds.rain
  if (weatherType === 'snow') return backgrounds.snow
  if (weatherType === 'overcast') return backgrounds.overcast
  
  // Check if freezing (below 40°F) for clear weather
  const isFreezing = temperature !== undefined && temperature < 40
  const isWinter = season === 'winter' || season === 'fall'
  
  // Determine if location is "northern" (cold climate) or "southern" (warm climate)
  // Based on latitude and current temperature
  // Latitudes above 35°N or below -35°S are typically colder
  // Also consider current temperature - if warm (>60°F), use tropical backgrounds
  const isWarmLocation = (latitude !== undefined && Math.abs(latitude) < 35) || 
                         (temperature !== undefined && temperature > 60)
  const isColdLocation = !isWarmLocation
  
  // Clear sky
  if (weatherType === 'clear') {
    if (!isDay) {
      // Night backgrounds based on location warmth
      return isWarmLocation ? backgrounds.clear_night_south : backgrounds.clear_night_north
    }
    if (isFreezing || isWinter) return backgrounds.clear_winter_day
    return backgrounds.clear_summer_day
  }
  
  // Partly cloudy
  if (weatherType === 'partlyCloudy') {
    if (!isDay) {
      return isWarmLocation ? backgrounds.partlyCloudy_night_south : backgrounds.partlyCloudy_night_north
    }
    if (isWinter) return backgrounds.partlyCloudy_winter_day
    return backgrounds.partlyCloudy_summer_day
  }
  
  // Default
  return backgrounds.clear_summer_day
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffffff' },
    background: { default: 'transparent', paper: 'rgba(255, 255, 255, 0.05)' },
    text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  },
  typography: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' },
})

// Unsplash API for location-specific photos
// Get your free API key at: https://unsplash.com/developers
const UNSPLASH_ACCESS_KEY = '' // Add your Unsplash access key here

function App() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [weatherType, setWeatherType] = useState('clear')
  const [bedrockConnected, setBedrockConnected] = useState(false)
  const [stormDemo, setStormDemo] = useState(false)
  const [placePhoto, setPlacePhoto] = useState(null) // Photo from Google Places API
  const [photoAttribution, setPhotoAttribution] = useState(null)

  useEffect(() => {
    checkBedrockConnection()
    searchCity('Miami')
  }, [])

  const checkBedrockConnection = async () => {
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setBedrockConnected(data.bedrock_connected === true)
    } catch (e) {
      setBedrockConnected(false)
    }
  }

  useEffect(() => {
    if (weather?.condition && !stormDemo) {
      setWeatherType(getWeatherType(weather.condition))
    }
  }, [weather?.condition, stormDemo])

  // Storm demo effect
  useEffect(() => {
    if (stormDemo) {
      setWeatherType('storm')
    } else if (weather?.condition) {
      setWeatherType(getWeatherType(weather.condition))
    }
  }, [stormDemo, weather?.condition])

  // Fetch weather-appropriate location photo from Unsplash
  const fetchPlacePhoto = async (city, weatherCondition = null, isNight = false) => {
    // Reset photo state
    setPlacePhoto(null)
    setPhotoAttribution(null)
    
    if (!UNSPLASH_ACCESS_KEY) {
      console.log('No Unsplash API key - using weather-based backgrounds')
      return
    }
    
    // Don't fetch Unsplash for storm/overcast/rain - use our curated dramatic images
    const weatherType = getWeatherType(weatherCondition || '')
    if (['storm', 'overcast', 'rain'].includes(weatherType)) {
      console.log(`Using curated ${weatherType} background for dramatic effect`)
      return
    }
    
    try {
      const params = new URLSearchParams({
        api_key: UNSPLASH_ACCESS_KEY,
        weather: weatherType,
        is_night: isNight.toString()
      })
      
      const response = await fetch(`/api/unsplash-photo/${encodeURIComponent(city)}?${params}`)
      const data = await response.json()
      
      if (data.photo_url) {
        setPlacePhoto(data.photo_url)
        setPhotoAttribution(data.attribution?.map(attr => ({
          ...attr,
          source: 'unsplash'
        })))
        console.log(`Unsplash: "${data.search_query}" → ${data.description || 'photo found'}`)
      }
    } catch (error) {
      console.error('Unsplash photo error:', error)
    }
  }

  const searchCity = async (city) => {
    if (!city?.trim()) return
    
    setLoading(true)
    setSelectedDay(null)
    setPlacePhoto(null) // Reset photo while loading
    
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather/${encodeURIComponent(city)}`),
        fetch(`/api/forecast/${encodeURIComponent(city)}?days=7`)
      ])
      const weatherData = await weatherRes.json()
      const forecastData = await forecastRes.json()
      
      if (weatherData.city) {
        setWeather(weatherData)
        
        // Determine if it's night based on sunrise/sunset
        const now = new Date()
        const sunrise = forecastData?.forecast?.[0]?.sunrise
        const sunset = forecastData?.forecast?.[0]?.sunset
        const isNight = sunrise && sunset 
          ? (now < new Date(sunrise) || now > new Date(sunset))
          : (now.getHours() < 6 || now.getHours() >= 18)
        
        // Fetch weather-appropriate photo for this location (non-blocking)
        fetchPlacePhoto(city, weatherData.condition, isNight)
      }
      if (forecastData.forecast) setForecast(forecastData)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // Calculate season, time of day, and get appropriate background
  const backgroundInfo = useMemo(() => {
    const now = new Date()
    const latitude = weather?.latitude || 40
    const season = getSeason(now, latitude)
    const sunrise = forecast?.forecast?.[0]?.sunrise
    const sunset = forecast?.forecast?.[0]?.sunset
    const isDay = isDaytime(sunrise, sunset)
    const temperature = weather?.temperature_f
    const currentWeatherType = stormDemo ? 'storm' : weatherType
    
    // Use Unsplash place photo for most weather conditions
    // Only use curated fallbacks for: storm, overcast, rain (need dramatic/specific imagery)
    const needsCuratedBackground = stormDemo || ['storm', 'overcast', 'rain'].includes(currentWeatherType)
    const canUsePlacePhoto = placePhoto && !needsCuratedBackground
    
    return {
      season,
      isDay,
      temperature,
      latitude,
      backgroundUrl: canUsePlacePhoto ? placePhoto : getBackground(currentWeatherType, season, isDay, temperature, latitude),
      currentWeatherType,
      isPlacePhoto: canUsePlacePhoto,
    }
  }, [weather, forecast, weatherType, stormDemo, placePhoto])

  const isStormy = stormDemo || weatherType === 'storm' || weatherType === 'rain'
  const isSnowy = weatherType === 'snow'
  const isRainy = stormDemo || weatherType === 'rain' || weatherType === 'storm'

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* Background - season, time, and weather aware */}
      <AnimatePresence mode="wait">
        <Box
          component={motion.div}
          key={backgroundInfo.backgroundUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundImage: `url(${backgroundInfo.backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      </AnimatePresence>
      
      {/* Overlay - adapts to weather and time of day */}
      <Box sx={{
        position: 'fixed',
        inset: 0,
        background: isStormy 
          ? 'linear-gradient(180deg, rgba(10,10,30,0.5) 0%, rgba(5,5,20,0.7) 100%)'
          : isSnowy
            ? 'linear-gradient(180deg, rgba(200,210,230,0.2) 0%, rgba(150,160,180,0.3) 100%)'
            : !backgroundInfo.isDay
              ? 'linear-gradient(180deg, rgba(10,15,30,0.4) 0%, rgba(5,10,25,0.6) 100%)' // Nighttime overlay
              : 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)',
        zIndex: 1,
      }} />

      {/* Storm Effect */}
      {isStormy && <StormEffect intensity={stormDemo || weatherType === 'storm' ? 2 : 1} />}
      
      {/* Snow Effect */}
      {isSnowy && <SnowEffect intensity={1.5} />}

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 20, minHeight: '100vh' }}>
        <MainContent 
          weather={weather}
          forecast={forecast}
          loading={loading}
          onSearch={searchCity}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          bedrockConnected={bedrockConnected}
          stormDemo={stormDemo}
          setStormDemo={setStormDemo}
          weatherType={backgroundInfo.currentWeatherType}
          isRainy={isRainy}
          isDay={backgroundInfo.isDay}
          photoAttribution={backgroundInfo.isPlacePhoto ? photoAttribution : null}
        />
      </Box>
    </ThemeProvider>
  )
}

export default App
