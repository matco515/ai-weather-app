import React from 'react'
import { Box, Paper, Typography, Grid, LinearProgress } from '@mui/material'
import { Air, WbSunny, Visibility, Opacity, Thermostat, Compress } from '@mui/icons-material'
import { motion } from 'framer-motion'

const HighlightCard = ({ title, icon: Icon, children, delay = 0 }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    sx={{
      p: 2.5,
      borderRadius: 3,
      bgcolor: 'rgba(26, 26, 46, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.05)',
      height: '100%',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Icon sx={{ color: 'text.secondary', fontSize: 20 }} />
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Box>
    {children}
  </Paper>
)

const TodayHighlights = ({ weather }) => {
  // Calculate comfort level based on humidity and temp
  const getComfortLevel = () => {
    const humidity = weather.humidity
    const temp = weather.temperature_f
    if (humidity > 70 && temp > 80) return { level: 'Uncomfortable', color: '#FF6B6B' }
    if (humidity > 60 && temp > 75) return { level: 'Slightly humid', color: '#FFB800' }
    if (humidity < 30) return { level: 'Dry', color: '#42A5F5' }
    return { level: 'Comfortable', color: '#4CAF50' }
  }

  const comfort = getComfortLevel()

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Current Conditions
      </Typography>
      
      <Grid container spacing={2}>
        {/* Wind */}
        <Grid item xs={6} md={4}>
          <HighlightCard title="Wind Speed" icon={Air} delay={0.1}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {Math.round(weather.wind_speed_mph)}
              </Typography>
              <Typography variant="body2" color="text.secondary">mph</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(weather.wind_speed_mph * 3, 100)}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: weather.wind_speed_mph > 20 ? '#FFB800' : '#6C63FF',
                  borderRadius: 3,
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {weather.wind_speed_mph < 10 ? 'Light breeze' : 
               weather.wind_speed_mph < 20 ? 'Moderate wind' : 'Strong wind'}
            </Typography>
          </HighlightCard>
        </Grid>

        {/* Humidity */}
        <Grid item xs={6} md={4}>
          <HighlightCard title="Humidity" icon={Opacity} delay={0.2}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {weather.humidity}
              </Typography>
              <Typography variant="body2" color="text.secondary">%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={weather.humidity}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: weather.humidity > 70 ? '#42A5F5' : '#6C63FF',
                  borderRadius: 3,
                }
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: comfort.color }}>
              {comfort.level}
            </Typography>
          </HighlightCard>
        </Grid>

        {/* Feels Like */}
        <Grid item xs={6} md={4}>
          <HighlightCard title="Feels Like" icon={Thermostat} delay={0.3}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {Math.round(weather.feels_like_f)}
              </Typography>
              <Typography variant="body2" color="text.secondary">°F</Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.05)',
            }}>
              {weather.feels_like_f > weather.temperature_f ? (
                <Typography variant="caption" color="text.secondary">
                  🥵 Feels warmer due to humidity
                </Typography>
              ) : weather.feels_like_f < weather.temperature_f ? (
                <Typography variant="caption" color="text.secondary">
                  🌬️ Feels cooler due to wind
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  😊 Matches actual temperature
                </Typography>
              )}
            </Box>
          </HighlightCard>
        </Grid>

        {/* UV Index */}
        <Grid item xs={6} md={4}>
          <HighlightCard title="UV Index" icon={WbSunny} delay={0.4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFB800 0%, #FF6B6B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
                  5
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>Moderate</Typography>
                <Typography variant="caption" color="text.secondary">
                  Wear sunscreen
                </Typography>
              </Box>
            </Box>
          </HighlightCard>
        </Grid>

        {/* Visibility */}
        <Grid item xs={6} md={4}>
          <HighlightCard title="Visibility" icon={Visibility} delay={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>10</Typography>
              <Typography variant="body2" color="text.secondary">km</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              ✓ Clear visibility
            </Typography>
          </HighlightCard>
        </Grid>

        {/* Pressure */}
        <Grid item xs={6} md={4}>
          <HighlightCard title="Pressure" icon={Compress} delay={0.6}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>1013</Typography>
              <Typography variant="body2" color="text.secondary">hPa</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Normal atmospheric pressure
            </Typography>
          </HighlightCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TodayHighlights
