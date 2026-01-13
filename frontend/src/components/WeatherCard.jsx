import React, { useEffect, useRef } from 'react'
import { Box, Paper, Typography, Grid } from '@mui/material'
import { WaterDrop, Air, Thermostat, LocationOn } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

const WeatherCard = ({ weather }) => {
  const tempRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    // Animate temperature number counting up
    if (tempRef.current && weather?.temperature_f) {
      gsap.fromTo(
        tempRef.current,
        { innerHTML: 0 },
        {
          innerHTML: Math.round(weather.temperature_f),
          duration: 1.5,
          ease: "power2.out",
          snap: { innerHTML: 1 },
          onUpdate: function() {
            tempRef.current.innerHTML = Math.round(this.targets()[0].innerHTML)
          }
        }
      )
    }

    // Card entrance animation
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { rotateY: -15, rotateX: 5 },
        { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power2.out" }
      )
    }
  }, [weather])

  if (!weather) return null

  const getWeatherGradient = (condition) => {
    const lower = condition?.toLowerCase() || ''
    if (lower.includes('sunny') || lower.includes('clear')) {
      return 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)'
    }
    if (lower.includes('cloud')) {
      return 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)'
    }
    if (lower.includes('rain') || lower.includes('drizzle')) {
      return 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)'
    }
    if (lower.includes('snow')) {
      return 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%)'
    }
    if (lower.includes('thunder') || lower.includes('storm')) {
      return 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)'
    }
    return 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)'
  }

  return (
    <Paper
      ref={cardRef}
      component={motion.div}
      whileHover={{ scale: 1.02, rotateY: 2 }}
      sx={{
        p: 3,
        mb: 3,
        background: getWeatherGradient(weather.condition),
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        filter: 'blur(40px)',
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <LocationOn sx={{ fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {weather.city}{weather.country && `, ${weather.country}`}
          </Typography>
        </Box>

        {/* Main temperature and condition */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Typography
                ref={tempRef}
                variant="h1"
                sx={{ 
                  fontSize: '5rem', 
                  fontWeight: 700,
                  lineHeight: 1,
                  textShadow: '2px 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                {Math.round(weather.temperature_f)}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, opacity: 0.8 }}>°F</Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
              Feels like {Math.round(weather.feels_like_f)}°F
            </Typography>
          </Grid>
          
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Typography variant="h2" sx={{ fontSize: '4rem' }}>
                {weather.condition?.split(' ').pop() || '🌤️'}
              </Typography>
            </motion.div>
            <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
              {weather.condition?.replace(/[^\w\s]/g, '').trim() || 'Unknown'}
            </Typography>
          </Grid>
        </Grid>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Paper sx={{ 
                p: 1.5, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <WaterDrop />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Humidity</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {weather.humidity}%
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={6}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Paper sx={{ 
                p: 1.5, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Air />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Wind</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {Math.round(weather.wind_speed_mph)} mph
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default WeatherCard
