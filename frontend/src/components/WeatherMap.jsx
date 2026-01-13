import React from 'react'
import { Box, Paper, Typography, Chip, IconButton, Select, MenuItem } from '@mui/material'
import { Add, Remove, MyLocation, Layers } from '@mui/icons-material'
import { motion } from 'framer-motion'

const LocationPin = ({ city, temp, condition, x, y, isMain }) => {
  const getIcon = () => {
    const lower = condition?.toLowerCase() || ''
    if (lower.includes('rain')) return '🌧️'
    if (lower.includes('cloud')) return '☁️'
    if (lower.includes('storm')) return '⛈️'
    return '☀️'
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}>
        {/* Glow effect for main city */}
        {isMain && (
          <Box sx={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.3) 0%, transparent 70%)',
            animation: 'pulse 2s infinite',
          }} />
        )}
        
        <Box sx={{
          bgcolor: isMain ? 'rgba(0, 217, 255, 0.9)' : 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: isMain ? '2px solid rgba(0, 217, 255, 0.5)' : '1px solid rgba(255,255,255,0.1)',
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {temp}°
          </Typography>
          {isMain && (
            <>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                💨 15 km/h
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                💧 90%
              </Typography>
            </>
          )}
        </Box>
        
        <Box sx={{ fontSize: isMain ? 24 : 18 }}>{getIcon()}</Box>
        
        {isMain && (
          <Typography variant="caption" sx={{ 
            bgcolor: 'rgba(0,0,0,0.5)', 
            px: 1, 
            py: 0.25, 
            borderRadius: 1,
            fontWeight: 500,
          }}>
            {city}
          </Typography>
        )}
      </Box>
    </motion.div>
  )
}

const WeatherMap = ({ weather }) => {
  // Mock nearby cities
  const nearbyCities = [
    { city: 'California, US', temp: 21, condition: 'cloudy', x: 65, y: 35 },
    { city: 'Texas, US', temp: 23, condition: 'sunny', x: 35, y: 55 },
    { city: 'Florida, US', temp: 30, condition: 'storm', x: 75, y: 75 },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Weather Condition Map
        </Typography>
        <Select
          size="small"
          defaultValue={24}
          sx={{
            bgcolor: 'rgba(26, 26, 46, 0.6)',
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <MenuItem value={24}>24 hr</MenuItem>
          <MenuItem value={48}>48 hr</MenuItem>
          <MenuItem value={72}>72 hr</MenuItem>
        </Select>
      </Box>

      <Paper
        sx={{
          borderRadius: 3,
          bgcolor: 'rgba(26, 26, 46, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Legend */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Precipitation
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            alignItems: 'center',
          }}>
            <Box sx={{ 
              flex: 1, 
              height: 6, 
              borderRadius: 3,
              background: 'linear-gradient(90deg, #FF4444 0%, #FF8844 25%, #FFAA44 50%, #44AAFF 75%, #4488FF 100%)',
            }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Extreme</Typography>
            <Typography variant="caption" color="text.secondary">Heavy</Typography>
            <Typography variant="caption" color="text.secondary">Moderate</Typography>
            <Typography variant="caption" color="text.secondary">Light</Typography>
          </Box>
        </Box>

        {/* Map Area */}
        <Box sx={{ 
          position: 'relative', 
          height: 300,
          background: 'linear-gradient(180deg, rgba(13, 13, 26, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)',
          overflow: 'hidden',
        }}>
          {/* Map grid lines */}
          <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.1 }}>
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="white" strokeWidth="1" />
                <line x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="white" strokeWidth="1" />
              </React.Fragment>
            ))}
          </svg>

          {/* Map silhouette (simplified US shape) */}
          <Box sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            right: '10%',
            bottom: '20%',
            opacity: 0.15,
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cpath fill='%23ffffff' d='M10,20 Q20,15 30,18 L40,15 Q50,10 60,15 L70,12 Q80,15 90,20 L92,30 Q88,40 85,45 L75,50 Q60,52 50,48 L35,50 Q20,48 15,40 L10,30 Z'/%3E%3C/svg%3E") no-repeat center`,
            backgroundSize: 'contain',
          }} />

          {/* Weather locations */}
          <LocationPin 
            city={weather.city}
            temp={Math.round(weather.temperature_f)}
            condition={weather.condition}
            x={50}
            y={40}
            isMain
          />
          
          {nearbyCities.map((city, i) => (
            <LocationPin 
              key={city.city}
              {...city}
              isMain={false}
            />
          ))}
        </Box>

        {/* Map controls */}
        <Box sx={{
          position: 'absolute',
          right: 16,
          top: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}>
          <IconButton 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(26, 26, 46, 0.9)', 
              '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.3)' }
            }}
          >
            <Add fontSize="small" />
          </IconButton>
          <IconButton 
            size="small"
            sx={{ 
              bgcolor: 'rgba(26, 26, 46, 0.9)', 
              '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.3)' }
            }}
          >
            <Remove fontSize="small" />
          </IconButton>
          <IconButton 
            size="small"
            sx={{ 
              bgcolor: 'rgba(26, 26, 46, 0.9)', 
              '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.3)' }
            }}
          >
            <MyLocation fontSize="small" />
          </IconButton>
          <IconButton 
            size="small"
            sx={{ 
              bgcolor: 'rgba(26, 26, 46, 0.9)', 
              '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.3)' }
            }}
          >
            <Layers fontSize="small" />
          </IconButton>
        </Box>

        {/* Bottom cities bar */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 2,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          overflowX: 'auto',
        }}>
          {[
            { name: 'California, US', icon: '☀️' },
            { name: 'Texas, US', icon: '⛅' },
            { name: 'Florida, US', icon: '⛈️' },
          ].map((city) => (
            <Chip
              key={city.name}
              label={`${city.icon} ${city.name}`}
              variant="outlined"
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': { borderColor: 'primary.main' },
              }}
            />
          ))}
        </Box>
      </Paper>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
        `}
      </style>
    </Box>
  )
}

export default WeatherMap
