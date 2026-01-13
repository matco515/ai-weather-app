import React from 'react'
import { Box, Paper, Typography, Chip } from '@mui/material'
import { WaterDrop, Air, Thermostat } from '@mui/icons-material'
import { motion } from 'framer-motion'

const getWeatherIcon = (condition) => {
  const lower = condition?.toLowerCase() || ''
  if (lower.includes('thunder') || lower.includes('storm')) return '⛈️'
  if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️'
  if (lower.includes('snow')) return '🌨️'
  if (lower.includes('cloud') || lower.includes('overcast')) return '☁️'
  if (lower.includes('partly')) return '⛅'
  return '☀️'
}

const getDayName = (dateString, index) => {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

const getDateShort = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ForecastCard = ({ day, index, isSelected, onClick }) => {
  const dayName = getDayName(day.date, index)
  const icon = getWeatherIcon(day.condition)
  const rainChance = day.precipitation_chance || 0
  
  return (
    <Paper
      component={motion.div}
      whileHover={{ scale: 1.03, y: -6, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderRadius: 3,
        bgcolor: isSelected ? 'rgba(108, 99, 255, 0.2)' : 'rgba(26, 26, 46, 0.6)',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'rgba(108, 99, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(108, 99, 255, 0.3)',
        },
      }}
    >
      {/* Day Name & Date */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {dayName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getDateShort(day.date)}
        </Typography>
      </Box>

      {/* Icon & Temp */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Box sx={{ fontSize: 36 }}>{icon}</Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {Math.round(day.high_f)}°
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ↓ {Math.round(day.low_f)}°
          </Typography>
        </Box>
      </Box>

      {/* Condition */}
      <Typography variant="caption" color="text.secondary" sx={{ 
        display: 'block',
        mb: 1.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {day.condition?.replace(/[^\w\s]/g, '').trim()}
      </Typography>

      {/* Key Metric: Rain Chance */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        p: 1,
        borderRadius: 2,
        bgcolor: rainChance > 50 ? 'rgba(66, 165, 245, 0.2)' : 'rgba(255,255,255,0.05)',
      }}>
        <WaterDrop sx={{ 
          fontSize: 16, 
          color: rainChance > 50 ? '#42A5F5' : 'text.secondary' 
        }} />
        <Typography variant="body2" sx={{ 
          fontWeight: rainChance > 50 ? 600 : 400,
          color: rainChance > 50 ? '#42A5F5' : 'text.secondary',
        }}>
          {rainChance}% rain
        </Typography>
      </Box>
    </Paper>
  )
}

const WeeklyForecast = ({ forecast, onDaySelect, selectedDay }) => {
  if (!forecast?.forecast) return null

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          7-Day Forecast
        </Typography>
        <Chip 
          label="Click day for details" 
          size="small" 
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.2)', fontSize: 11 }}
        />
      </Box>

      {/* Scrollable forecast cards */}
      <Box sx={{ 
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        overflowY: 'visible',
        pb: 2,
        pt: 1,
        mx: -2,
        px: 2,
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { 
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 3,
        },
      }}>
        {forecast.forecast.map((day, index) => (
          <Box key={day.date} sx={{ minWidth: 140, flexShrink: 0, overflow: 'visible' }}>
            <ForecastCard 
              day={day}
              index={index}
              isSelected={selectedDay?.date === day.date}
              onClick={() => onDaySelect(day, index)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default WeeklyForecast
