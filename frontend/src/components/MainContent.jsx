import React from 'react'
import { Box, Typography, Grid, CircularProgress, IconButton, Chip, Switch } from '@mui/material'
import { Search, CloudQueue, Air, Opacity, Thermostat, WbTwilight, ArrowBack, WaterDrop, MyLocation, Bolt } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import WaterDropletEffect from './WaterDropletEffect'

// Glassmorphic card - darker with better text contrast
const glassCard = {
  background: 'rgba(0, 0, 0, 0.35)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  color: '#ffffff',
}

const getWeatherIcon = (condition, size = 48) => {
  const lower = condition?.toLowerCase() || ''
  const icons = { 'thunder': '⛈️', 'storm': '⛈️', 'rain': '🌧️', 'drizzle': '🌧️', 'snow': '🌨️', 'cloud': '☁️', 'overcast': '☁️', 'partly': '⛅', 'fog': '🌫️' }
  for (const [key, icon] of Object.entries(icons)) if (lower.includes(key)) return <span style={{ fontSize: size }}>{icon}</span>
  return <span style={{ fontSize: size }}>☀️</span>
}

const quickCities = ['New York', 'London', 'Tokyo', 'Sydney', 'Dubai', 'Paris']

const MainContent = ({ weather, forecast, loading, onSearch, selectedDay, setSelectedDay, bedrockConnected, stormDemo, setStormDemo, weatherType, isRainy, isDay, photoAttribution }) => {
  const inputRef = React.useRef(null)
  const [searchValue, setSearchValue] = React.useState('')
  const [suggestions, setSuggestions] = React.useState([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const debounceRef = React.useRef(null)
  
  const handleSearch = (e) => { 
    e?.preventDefault()
    const value = inputRef.current?.value?.trim() || searchValue.trim()
    if (value) { 
      onSearch(value)
      setSearchValue('')
      setSuggestions([])
      setShowSuggestions(false)
      if (inputRef.current) inputRef.current.value = ''
    } 
  }
  
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    
    // Debounce API calls
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    if (value.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/geocode?query=${encodeURIComponent(value)}`)
          const data = await res.json()
          setSuggestions(data.suggestions || [])
          setShowSuggestions(true)
        } catch (e) {
          console.error('Geocode error:', e)
        }
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }
  
  const selectSuggestion = (suggestion) => {
    onSearch(suggestion.name)
    setSearchValue('')
    setSuggestions([])
    setShowSuggestions(false)
    if (inputRef.current) inputRef.current.value = ''
  }
  
  const [currentTime, setCurrentTime] = React.useState(new Date())
  
  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudQueue sx={{ fontSize: 28, color: '#64B5F6' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>forecast<span style={{ opacity: 0.5 }}>.ai</span></Typography>
          </Box>
          {/* Bedrock Status */}
          <Chip 
            size="small"
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bedrockConnected ? '#4CAF50' : '#FF5252', ml: 1 }} />}
            label={bedrockConnected ? 'Live' : 'Demo'}
            sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.65rem' }} 
          />
          {/* Storm Demo Toggle */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            bgcolor: stormDemo ? 'rgba(100,100,200,0.3)' : 'rgba(255,255,255,0.05)',
            borderRadius: 20,
            px: 1.5,
            py: 0.3,
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => setStormDemo(!stormDemo)}
          >
            <Bolt sx={{ fontSize: 16, color: stormDemo ? '#FFD93D' : 'rgba(255,255,255,0.5)' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'white' }}>Storm</Typography>
            <Switch 
              checked={stormDemo} 
              onChange={(e) => setStormDemo(e.target.checked)}
              size="small"
              sx={{ 
                ml: 0.5,
                '& .MuiSwitch-thumb': { width: 14, height: 14 },
                '& .MuiSwitch-track': { borderRadius: 10 },
              }}
            />
          </Box>
        </Box>
        
        {/* Search Bar with Autocomplete */}
        <Box sx={{ position: 'relative', minWidth: 280, zIndex: 100 }}>
          <Box component="form" onSubmit={handleSearch} sx={{ ...glassCard, display: 'flex', alignItems: 'center', px: 2, py: 0.8, borderRadius: 50 }}>
            <Search sx={{ mr: 1, opacity: 0.6, fontSize: 20 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city..."
              value={searchValue}
              onChange={handleInputChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'white', 
                fontSize: '0.9rem',
              }}
              className="search-input"
            />
            <style>{`
              .search-input::placeholder {
                color: rgba(255, 255, 255, 0.9);
              }
            `}</style>
            <IconButton type="submit" sx={{ color: 'white', p: 0.5 }}><MyLocation fontSize="small" /></IconButton>
          </Box>
          
          {/* Autocomplete Suggestions - Positioned as overlay */}
          {showSuggestions && suggestions.length > 0 && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{
                ...glassCard,
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                borderRadius: 3,
                overflow: 'hidden',
                zIndex: 1000,
              }}
            >
              {suggestions.map((suggestion, i) => (
                <Box
                  key={i}
                  onClick={() => selectSuggestion(suggestion)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    transition: 'all 0.15s',
                  }}
                >
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{suggestion.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', opacity: 0.5 }}>
                    {suggestion.admin1 ? `${suggestion.admin1}, ` : ''}{suggestion.country}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.8rem' }}>{dateStr}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '1rem', fontWeight: 500 }}>{timeStr}</Typography>
        </Box>
      </Box>

      {/* Quick Cities */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {quickCities.map(city => (
          <Chip
            key={city}
            label={city}
            size="small"
            onClick={() => onSearch(city)}
            sx={{ 
              bgcolor: weather?.city?.toLowerCase().includes(city.toLowerCase()) ? 'rgba(100,181,246,0.25)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '0.7rem',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
            }}
          />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress sx={{ color: 'white' }} /></Box>
      ) : weather ? (
        <AnimatePresence mode="wait">
          {selectedDay ? (
            <DayDetailView key="detail" day={selectedDay} city={weather.city} onBack={() => setSelectedDay(null)} />
          ) : (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={2} sx={{ flex: 1 }}>
                {/* Main Weather Card */}
                <Grid item xs={12} md={7} lg={8}>
                  <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    sx={{ ...glassCard, p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                    <WaterDropletEffect active={isRainy} />
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Typography sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 200, letterSpacing: -2, lineHeight: 1 }}>
                        {stormDemo ? 'Thunderstorm' : (weather.condition?.replace(/[^\w\s]/g, '').trim() || 'Clear')}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.5, mt: 1, maxWidth: 400 }}>
                        {stormDemo ? 'Severe weather demo - showing storm animation' : getConditionDescription(weather.condition)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, my: 3, position: 'relative', zIndex: 2 }}>
                      <Typography sx={{ fontSize: { xs: '6rem', md: '8rem' }, fontWeight: 100, lineHeight: 0.8, letterSpacing: -8 }}>
                        {stormDemo ? 58 : Math.round(weather.temperature_f)}
                      </Typography>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 200, mb: 2 }}>°F</Typography>
                      <Box sx={{ ml: 'auto', mb: 2 }}>{stormDemo ? <span style={{ fontSize: 80 }}>⛈️</span> : getWeatherIcon(weather.condition, 80)}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: stormDemo ? '#FF5252' : '#4CAF50', boxShadow: stormDemo ? '0 0 10px #FF5252' : '0 0 10px #4CAF50' }} />
                      <Typography variant="h6" sx={{ fontWeight: 400 }}>{stormDemo ? 'Demo Mode' : `${weather.city}${weather.country ? `, ${weather.country}` : ''}`}</Typography>
                    </Box>
                    {/* Photo attribution from Unsplash */}
                    {photoAttribution && photoAttribution.length > 0 && (
                      <Typography 
                        sx={{ 
                          fontSize: '0.6rem', 
                          opacity: 0.5, 
                          mt: 1,
                          '& a': { color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }
                        }}
                      >
                        📷 Photo by{' '}
                        <a 
                          href={photoAttribution[0].uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {photoAttribution[0].displayName}
                        </a>
                        {' '}on{' '}
                        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Stats */}
                <Grid item xs={12} md={5} lg={4}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2} sx={{ flex: 1 }}>
                      <Grid item xs={6}><StatCard type="wind" value={stormDemo ? 35 : Math.round(weather.wind_speed_mph || 0)} isRainy={isRainy} /></Grid>
                      <Grid item xs={6}><StatCard type="humidity" value={stormDemo ? 92 : (weather.humidity || 0)} isRainy={isRainy} /></Grid>
                      <Grid item xs={6}><StatCard type="feelsLike" value={stormDemo ? 52 : Math.round(weather.feels_like_f || weather.temperature_f)} extra={stormDemo ? 58 : Math.round(weather.temperature_f)} isRainy={isRainy} /></Grid>
                      <Grid item xs={6}><StatCard type="rain" value={stormDemo ? 95 : (forecast?.forecast?.[0]?.precipitation_chance || 0)} isRainy={isRainy} /></Grid>
                    </Grid>
                    <Box sx={{ ...glassCard, p: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <WbTwilight sx={{ fontSize: 22, color: '#FFD93D' }} />
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.5, fontSize: '0.6rem' }}>Sunrise</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{forecast?.forecast?.[0]?.sunrise ? new Date(forecast.forecast[0].sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '6:42 AM'}</Typography>
                      </Box>
                      <SunArc 
                        sunriseTime={forecast?.forecast?.[0]?.sunrise} 
                        sunsetTime={forecast?.forecast?.[0]?.sunset}
                      />
                      <Box sx={{ textAlign: 'center' }}>
                        <WbTwilight sx={{ fontSize: 22, color: '#FF8E53', transform: 'scaleY(-1)' }} />
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.5, fontSize: '0.6rem' }}>Sunset</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{forecast?.forecast?.[0]?.sunset ? new Date(forecast.forecast[0].sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '5:48 PM'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* 7-Day Forecast */}
              {forecast?.forecast && (
                <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} sx={{ ...glassCard, p: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>7-Day Forecast</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.4 }}>Tap for details</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'space-between' }}>
                    {forecast.forecast.map((day, i) => {
                      const date = new Date(day.date)
                      const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })
                      return (
                        <Box key={day.date} component={motion.button} role="button" whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedDay(day)}
                          sx={{
                            flex: 1, p: 1.5, borderRadius: 3, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3,
                            background: i === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: 'white', transition: 'all 0.2s',
                            '&:hover': { background: 'rgba(255,255,255,0.12)' },
                          }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{dayName}</Typography>
                          <Box sx={{ my: 0.5 }}>{getWeatherIcon(day.condition, 26)}</Box>
                          <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>{Math.round(day.high_f)}°</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.4, fontSize: '0.65rem' }}>{Math.round(day.low_f)}°</Typography>
                          {day.precipitation_chance > 0 && (
                            <Typography sx={{ fontSize: '0.55rem', color: '#64B5F6', mt: 0.3 }}>💧{day.precipitation_chance}%</Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ ...glassCard, p: 5, textAlign: 'center', maxWidth: 400 }}>
            <CloudQueue sx={{ fontSize: 50, color: '#64B5F6', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Forecast.ai</Typography>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>Powered by Amazon Bedrock</Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// Professional Stat Cards
const StatCard = ({ type, value, extra, isRainy = false }) => {
  const configs = {
    wind: {
      icon: <Air />,
      label: 'Wind Speed',
      unit: 'mph',
      color: '#64B5F6',
      getStatus: (v) => v < 10 ? 'Calm' : v < 20 ? 'Breezy' : v < 30 ? 'Windy' : 'Strong',
      getGradient: (v) => `conic-gradient(from 180deg, #64B5F6 ${Math.min(v * 3, 100)}%, rgba(255,255,255,0.1) 0)`,
    },
    humidity: {
      icon: <Opacity />,
      label: 'Humidity',
      unit: '%',
      color: '#81C784',
      getStatus: (v) => v < 30 ? 'Dry' : v < 60 ? 'Comfortable' : v < 80 ? 'Humid' : 'Very Humid',
      getGradient: (v) => `linear-gradient(90deg, #81C784 ${v}%, rgba(255,255,255,0.1) ${v}%)`,
    },
    feelsLike: {
      icon: <Thermostat />,
      label: 'Feels Like',
      unit: '°F',
      color: '#FFB74D',
      getStatus: (v, actual) => {
        const diff = v - actual
        if (Math.abs(diff) < 3) return 'Accurate'
        return diff > 0 ? `+${Math.round(diff)}° warmer` : `${Math.round(diff)}° cooler`
      },
    },
    rain: {
      icon: <WaterDrop />,
      label: 'Rain Chance',
      unit: '%',
      color: '#4FC3F7',
      getStatus: (v) => v < 20 ? 'Unlikely' : v < 50 ? 'Possible' : v < 70 ? 'Likely' : 'Very Likely',
      getGradient: (v) => `linear-gradient(180deg, #4FC3F7 ${v}%, rgba(255,255,255,0.1) ${v}%)`,
    },
  }
  
  const config = configs[type]
  
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
      sx={{ ...glassCard, p: 2, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Water droplet effect - minimal on small cards */}
      <WaterDropletEffect active={isRainy} count={2} />
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ 
            p: 0.6, 
            borderRadius: '8px', 
            bgcolor: `${config.color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {React.cloneElement(config.icon, { sx: { fontSize: 16, color: config.color } })}
          </Box>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7 }}>
            {config.label}
          </Typography>
        </Box>
      </Box>
      
      {/* Value Display */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {type === 'wind' ? (
          <Box sx={{ position: 'relative', width: 60, height: 60 }}>
            {/* Clean circle - no pie chart */}
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              borderRadius: '50%',
              border: '3px solid rgba(100, 181, 246, 0.4)',
              background: 'rgba(100, 181, 246, 0.1)',
            }} />
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ fontSize: '0.55rem', opacity: 0.6, mt: 0.2 }}>{config.unit}</Typography>
            </Box>
          </Box>
        ) : type === 'humidity' || type === 'rain' ? (
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 500, lineHeight: 1, mb: 0.5 }}>
              {value}<Typography component="span" sx={{ fontSize: '0.9rem', opacity: 0.5 }}>{config.unit}</Typography>
            </Typography>
            <Box sx={{ 
              height: 6, 
              borderRadius: 3, 
              bgcolor: 'rgba(255,255,255,0.1)', 
              overflow: 'hidden',
              mt: 1,
            }}>
              <Box component={motion.div} 
                initial={{ width: 0 }} 
                animate={{ width: `${value}%` }} 
                transition={{ duration: 0.8, ease: 'easeOut' }}
                sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  bgcolor: config.color,
                  boxShadow: `0 0 10px ${config.color}50`,
                }} 
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography sx={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1 }}>
              {value}<Typography component="span" sx={{ fontSize: '0.9rem', opacity: 0.5 }}>{config.unit}</Typography>
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Status */}
      <Box sx={{ 
        mt: 'auto', 
        pt: 1.5, 
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Typography sx={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 500 }}>
          {config.getStatus(value, extra)}
        </Typography>
        <Box sx={{ 
          width: 6, 
          height: 6, 
          borderRadius: '50%', 
          bgcolor: config.color,
          boxShadow: `0 0 8px ${config.color}`,
        }} />
      </Box>
    </Box>
  )
}

// Redesigned Day Detail with REAL hourly data and hover tooltips
const DayDetailView = ({ day, city, onBack }) => {
  const [hoveredHour, setHoveredHour] = React.useState(null)
  const [stableHover, setStableHover] = React.useState(null)
  const hoverTimeoutRef = React.useRef(null)
  
  // Debounced hover to prevent flashing
  const handleMouseEnter = (index) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setHoveredHour(index)
    setStableHover(index)
  }
  
  const handleMouseLeave = () => {
    // Small delay before hiding to prevent flashing
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredHour(null)
      setStableHover(null)
    }, 150)
  }
  
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])
  const date = new Date(day.date)
  const fullDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  
  // Use real hourly data from API, or generate fallback
  const hourlyData = day.hourly?.length > 0 
    ? day.hourly.slice(6, 22).map((h, i) => { // Show 6AM to 10PM
        const hourDate = new Date(h.time)
        const currentHour = new Date().getHours()
        const hourNum = hourDate.getHours()
        return {
          time: hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temp: Math.round(h.temp_f),
          feelsLike: Math.round(h.feels_like_f || h.temp_f),
          humidity: h.humidity || 0,
          rain: h.rain_chance || 0,
          wind: Math.round(h.wind_mph || 0),
          condition: h.condition,
          isNow: new Date(day.date).toDateString() === new Date().toDateString() && hourNum === currentHour,
          fullTime: hourDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        }
      })
    : generateHourlyData(day.high_f, day.low_f, day.condition)
  
  // Calculate average stats from real hourly data
  const avgWind = day.hourly?.length > 0 
    ? Math.round(day.hourly.reduce((sum, h) => sum + (h.wind_mph || 0), 0) / day.hourly.length)
    : 12
  const avgHumidity = day.hourly?.length > 0
    ? Math.round(day.hourly.reduce((sum, h) => sum + (h.humidity || 0), 0) / day.hourly.length)
    : 65

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box component={motion.div} whileHover={{ x: -5 }} onClick={onBack} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, cursor: 'pointer', opacity: 0.6, '&:hover': { opacity: 1 } }}>
        <ArrowBack fontSize="small" /><Typography variant="body2">Back</Typography>
      </Box>
      
      <Grid container spacing={2} sx={{ flex: 1 }}>
        {/* Day Summary */}
        <Grid item xs={12} md={4}>
          <Box sx={{ ...glassCard, p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 300, mb: 0.5 }}>{fullDate}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.4, mb: 2 }}>{city}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {getWeatherIcon(day.condition, 60)}
              <Box>
                <Typography sx={{ fontSize: '3.5rem', fontWeight: 100, lineHeight: 0.9 }}>{Math.round(day.high_f)}°</Typography>
                <Typography variant="body2" sx={{ opacity: 0.4 }}>Low {Math.round(day.low_f)}°</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 300, opacity: 0.8 }}>{day.condition?.replace(/[^\w\s]/g, '').trim()}</Typography>
            
            {/* Mini Stats with REAL data */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {[
                { icon: '💧', label: 'Rain', val: `${day.precipitation_chance}%` }, 
                { icon: '💨', label: 'Wind', val: `${avgWind}mph` }, 
                { icon: '💦', label: 'Humidity', val: `${avgHumidity}%` }
              ].map(({ icon, label, val }, i) => (
                <Box key={i} sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <Typography sx={{ fontSize: '1rem' }}>{icon}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{val}</Typography>
                  <Typography sx={{ fontSize: '0.55rem', opacity: 0.5 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
            
            {/* Sunrise/Sunset if available */}
            {day.sunrise && day.sunset && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.9rem' }}>🌅</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{new Date(day.sunrise).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</Typography>
                  <Typography sx={{ fontSize: '0.5rem', opacity: 0.5 }}>Sunrise</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.9rem' }}>🌇</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{new Date(day.sunset).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</Typography>
                  <Typography sx={{ fontSize: '0.5rem', opacity: 0.5 }}>Sunset</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
        
        {/* HOURLY FORECAST with REAL DATA and TOOLTIPS */}
        <Grid item xs={12} md={8}>
          <Box sx={{ ...glassCard, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                ⏱️ Hourly Breakdown
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', opacity: 0.5 }}>Hover for details</Typography>
            </Box>
            
            {/* Hover tooltip - pointer-events none to prevent flashing */}
            <AnimatePresence>
              {stableHover !== null && hourlyData[stableHover] && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginBottom: 16, pointerEvents: 'none' }}
                >
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(100,181,246,0.15)', 
                    border: '1px solid rgba(100,181,246,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', opacity: 0.6 }}>{hourlyData[stableHover].fullTime}</Typography>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>{hourlyData[stableHover].temp}°F</Typography>
                      {getWeatherIcon(hourlyData[stableHover].condition, 24)}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'space-around' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{hourlyData[stableHover].feelsLike}°</Typography>
                        <Typography sx={{ fontSize: '0.55rem', opacity: 0.6 }}>Feels Like</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{hourlyData[stableHover].humidity}%</Typography>
                        <Typography sx={{ fontSize: '0.55rem', opacity: 0.6 }}>Humidity</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{hourlyData[stableHover].wind}mph</Typography>
                        <Typography sx={{ fontSize: '0.55rem', opacity: 0.6 }}>Wind</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: hourlyData[stableHover].rain > 30 ? '#64B5F6' : 'inherit' }}>{hourlyData[stableHover].rain}%</Typography>
                        <Typography sx={{ fontSize: '0.55rem', opacity: 0.6 }}>Rain Chance</Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Hourly bars */}
            <Box sx={{ display: 'flex', gap: 0, flex: 1, position: 'relative' }}>
              {hourlyData.map((hour, i) => {
                const tempRange = Math.max(...hourlyData.map(h => h.temp)) - Math.min(...hourlyData.map(h => h.temp)) || 1
                const barHeight = ((hour.temp - Math.min(...hourlyData.map(h => h.temp))) / tempRange) * 100
                
                return (
                  <Box 
                    key={i}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                    sx={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      p: 0.5,
                      borderRadius: 1,
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.6rem', opacity: 0.6, fontWeight: hour.isNow ? 700 : 400, color: hour.isNow ? '#64B5F6' : 'inherit', mb: 0.3 }}>
                      {hour.time}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.3 }}>{hour.temp}°</Typography>
                    <Box sx={{ mb: 0.5 }}>{getWeatherIcon(hour.condition, 16)}</Box>
                    
                    {/* Temperature Bar */}
                    <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', minHeight: 60 }}>
                      <Box
                        component={motion.div}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(barHeight, 15)}%` }}
                        transition={{ duration: 0.5, delay: i * 0.03 }}
                        sx={{
                          width: hoveredHour === i ? 16 : hour.isNow ? 14 : 10,
                          borderRadius: 2,
                          background: hour.isNow 
                            ? 'linear-gradient(180deg, #64B5F6 0%, #1976D2 100%)'
                            : hoveredHour === i 
                              ? 'linear-gradient(180deg, rgba(100,181,246,0.5) 0%, rgba(100,181,246,0.2) 100%)'
                              : 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                          boxShadow: hour.isNow || hoveredHour === i ? '0 0 10px rgba(100,181,246,0.4)' : 'none',
                          transition: 'width 0.2s, background 0.2s',
                        }}
                      />
                    </Box>
                    
                    {hour.rain > 0 && (
                      <Typography sx={{ fontSize: '0.5rem', color: '#64B5F6', mt: 0.3 }}>💧{hour.rain}%</Typography>
                    )}
                  </Box>
                )
              })}
            </Box>
            
            {/* Legend */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 1, background: 'linear-gradient(180deg, #64B5F6 0%, #1976D2 100%)' }} />
                <Typography sx={{ fontSize: '0.6rem', opacity: 0.6 }}>Now</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.65rem' }}>💧</Typography>
                <Typography sx={{ fontSize: '0.6rem', opacity: 0.6 }}>Rain %</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.6rem', opacity: 0.4 }}>Real-time data from Open-Meteo</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </motion.div>
  )
}

// Helpers
const getConditionDescription = (c) => {
  const l = c?.toLowerCase() || ''
  if (l.includes('clear') || l.includes('sunny')) return 'Clear skies, perfect for outdoor activities'
  if (l.includes('cloud') || l.includes('overcast')) return 'Cloudy with limited sun'
  if (l.includes('rain') || l.includes('drizzle')) return 'Rainy, bring an umbrella'
  if (l.includes('storm') || l.includes('thunder')) return 'Severe weather, stay indoors'
  return 'Current conditions'
}

const generateHourlyData = (high, low, condition) => {
  const hours = [], currentHour = new Date().getHours()
  for (let i = 0; i < 12; i++) {
    const hour = (currentHour + i) % 24
    const dayProgress = (hour - 6) / 12
    let tempFactor = dayProgress < 0 ? 0.3 : dayProgress > 1 ? 0.4 : Math.sin(dayProgress * Math.PI) * 0.7 + 0.3
    hours.push({ 
      time: i === 0 ? 'Now' : `${hour % 12 || 12}${hour < 12 ? 'a' : 'p'}`, 
      temp: Math.round(low + (high - low) * tempFactor), 
      condition, 
      rain: condition?.toLowerCase().includes('rain') ? Math.floor(Math.random() * 40 + 20) : 0, 
      isNow: i === 0 
    })
  }
  return hours
}

const HumidityBar = ({ value }) => (
  <Box sx={{ mt: 1, height: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
    <Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }}
      sx={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #64B5F6, #81C784)' }} />
  </Box>
)

const SunArc = ({ sunriseTime, sunsetTime }) => {
  // Calculate actual sun position based on current time
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  // Parse sunrise/sunset times
  const sunriseMinutes = sunriseTime ? (() => {
    const d = new Date(sunriseTime)
    return d.getHours() * 60 + d.getMinutes()
  })() : 6 * 60 // Default 6 AM
  
  const sunsetMinutes = sunsetTime ? (() => {
    const d = new Date(sunsetTime)
    return d.getHours() * 60 + d.getMinutes()
  })() : 18 * 60 // Default 6 PM
  
  // Calculate progress (0 = sunrise, 1 = sunset)
  const dayLength = sunsetMinutes - sunriseMinutes
  const progress = Math.max(0, Math.min(1, (currentMinutes - sunriseMinutes) / dayLength))
  
  // Sun position on arc
  const x = 10 + progress * 80
  const y = 42 - Math.sin(progress * Math.PI) * 35
  
  // Is it daytime?
  const isDaytime = currentMinutes >= sunriseMinutes && currentMinutes <= sunsetMinutes
  
  return (
    <svg width="100" height="50" viewBox="0 0 100 50">
      {/* Arc path - subtle gradient */}
      <defs>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD93D" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#FF8E53" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      {/* Arc background */}
      <path 
        d="M 10 42 Q 50 5 90 42" 
        fill="none" 
        stroke="rgba(255,255,255,0.1)" 
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Progress arc */}
      {isDaytime && (
        <path 
          d={`M 10 42 Q ${10 + progress * 40} ${42 - Math.sin(progress * Math.PI) * 37} ${x} ${y}`}
          fill="none" 
          stroke="url(#arcGradient)" 
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      
      {/* Sun glow */}
      {isDaytime && (
        <>
          <circle cx={x} cy={y} r="10" fill="rgba(255,217,61,0.15)" />
          <circle cx={x} cy={y} r="6" fill="rgba(255,217,61,0.3)" />
          <circle cx={x} cy={y} r="4" fill="#FFD93D" />
        </>
      )}
      
      {/* Moon for nighttime */}
      {!isDaytime && (
        <>
          <circle cx="50" cy="20" r="6" fill="rgba(200,200,220,0.3)" />
          <circle cx="50" cy="20" r="4" fill="#E8E8F0" />
        </>
      )}
    </svg>
  )
}

export default MainContent
