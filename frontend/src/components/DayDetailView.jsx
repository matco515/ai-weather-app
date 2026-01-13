import React from 'react'
import { Box, Paper, Typography, Grid, IconButton, Chip, LinearProgress } from '@mui/material'
import { 
  Close, WaterDrop, Air, Thermostat, WbSunny, 
  Umbrella, Visibility, Compress, CalendarToday 
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

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
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

const StatCard = ({ icon: Icon, label, value, unit, color = 'text.secondary', highlight = false }) => (
  <Paper
    component={motion.div}
    whileHover={{ scale: 1.02 }}
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: highlight ? 'rgba(66, 165, 245, 0.15)' : 'rgba(26, 26, 46, 0.8)',
      border: '1px solid',
      borderColor: highlight ? 'rgba(66, 165, 245, 0.3)' : 'rgba(255,255,255,0.05)',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Icon sx={{ fontSize: 18, color }} />
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      {value}<Typography component="span" variant="body2" color="text.secondary"> {unit}</Typography>
    </Typography>
  </Paper>
)

const DayDetailView = ({ day, city, onClose }) => {
  const dayName = getDayName(day.date, day.index)
  const dateFormatted = new Date(day.date).toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric' 
  })
  const rainChance = day.precipitation_chance || 0
  const conditionText = day.condition?.replace(/[^\w\s]/g, '').trim() || 'Clear'

  // Generate mock hourly data based on high/low temps
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    const tempRange = day.high_f - day.low_f
    // Simulate temperature curve: lowest at 6am, highest at 3pm
    const tempOffset = Math.sin((hour - 6) * Math.PI / 12) * (tempRange / 2)
    const temp = (day.high_f + day.low_f) / 2 + tempOffset
    return {
      hour: `${hour}:00`,
      temp: Math.round(temp),
      rain: Math.random() < rainChance / 100 ? Math.round(Math.random() * 5) : 0,
    }
  })

  // What to wear / bring recommendations
  const getRecommendations = () => {
    const recs = []
    if (rainChance > 30) recs.push({ icon: '☂️', text: 'Bring umbrella' })
    if (rainChance > 60) recs.push({ icon: '🧥', text: 'Rain jacket' })
    if (day.high_f > 85) recs.push({ icon: '😎', text: 'Sunglasses' })
    if (day.high_f > 80) recs.push({ icon: '🧴', text: 'Sunscreen' })
    if (day.low_f < 50) recs.push({ icon: '🧣', text: 'Warm layers' })
    if (day.low_f < 32) recs.push({ icon: '🧤', text: 'Gloves & hat' })
    if (recs.length === 0) recs.push({ icon: '👕', text: 'Light clothing' })
    return recs
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: 'rgba(26, 26, 46, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CalendarToday sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {dayName}'s Forecast
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {dateFormatted} • {city}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Main Weather Display */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3, 
        mb: 3,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(0, 217, 255, 0.05) 100%)',
      }}>
        <Box sx={{ fontSize: 72 }}>{getWeatherIcon(day.condition)}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 300, lineHeight: 1 }}>
            {Math.round(day.high_f)}°
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Low: {Math.round(day.low_f)}° • {conditionText}
          </Typography>
        </Box>
        
        {/* Rain Chance - Prominent */}
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%',
            border: '3px solid',
            borderColor: rainChance > 50 ? '#42A5F5' : 'rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: rainChance > 50 ? 'rgba(66, 165, 245, 0.1)' : 'transparent',
          }}>
            <WaterDrop sx={{ color: rainChance > 50 ? '#42A5F5' : 'text.secondary', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: rainChance > 50 ? '#42A5F5' : 'inherit' }}>
              {rainChance}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">Rain Chance</Typography>
        </Box>
      </Box>

      {/* Temperature Throughout Day */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Temperature Throughout Day
        </Typography>
        <Box sx={{ height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="hour" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8B8B9E', fontSize: 10 }}
                interval={5}
              />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A2E', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#6C63FF" 
                strokeWidth={2}
                fill="url(#tempGradient)"
                name="Temperature"
                unit="°F"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Weather Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard 
            icon={Thermostat} 
            label="Feels Like" 
            value={Math.round(day.high_f - 2)} 
            unit="°F" 
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard 
            icon={WaterDrop} 
            label="Precipitation" 
            value={rainChance} 
            unit="%" 
            color={rainChance > 50 ? '#42A5F5' : 'text.secondary'}
            highlight={rainChance > 50}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard 
            icon={Air} 
            label="Wind" 
            value={Math.round(8 + Math.random() * 10)} 
            unit="mph" 
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard 
            icon={Visibility} 
            label="UV Index" 
            value={Math.round(3 + Math.random() * 5)} 
            unit="" 
          />
        </Grid>
      </Grid>

      {/* Recommendations */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          What to Bring
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {getRecommendations().map((rec, i) => (
            <Chip
              key={i}
              label={`${rec.icon} ${rec.text}`}
              variant="outlined"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': { borderColor: 'primary.main' },
              }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  )
}

export default DayDetailView
