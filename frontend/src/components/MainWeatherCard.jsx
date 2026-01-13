import React, { useEffect, useRef } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { LocationOn, CalendarToday } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

const getWeatherIcon = (condition) => {
  const lower = condition?.toLowerCase() || ''
  if (lower.includes('thunder') || lower.includes('storm')) return '⛈️'
  if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️'
  if (lower.includes('snow')) return '🌨️'
  if (lower.includes('cloud') || lower.includes('overcast')) return '☁️'
  if (lower.includes('partly')) return '⛅'
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️'
  return '☀️'
}

// Dynamic backgrounds based on weather
const getWeatherBackground = (condition) => {
  const lower = condition?.toLowerCase() || ''
  
  // Sunny / Clear
  if (lower.includes('clear') || lower.includes('sunny') || (!lower.includes('cloud') && !lower.includes('rain') && !lower.includes('storm'))) {
    return {
      image: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&q=80',
      gradient: 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(14, 165, 233, 0.3) 100%)',
      overlay: 'rgba(0,0,0,0.1)',
    }
  }
  
  // Cloudy / Overcast
  if (lower.includes('cloud') || lower.includes('overcast')) {
    return {
      image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80',
      gradient: 'linear-gradient(135deg, rgba(51, 65, 85, 0.5) 0%, rgba(71, 85, 105, 0.5) 100%)',
      overlay: 'rgba(0,0,0,0.2)',
    }
  }
  
  // Rainy / Drizzle
  if (lower.includes('rain') || lower.includes('drizzle')) {
    return {
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80',
      gradient: 'linear-gradient(135deg, rgba(30, 58, 95, 0.6) 0%, rgba(45, 74, 111, 0.6) 100%)',
      overlay: 'rgba(0,0,0,0.3)',
    }
  }
  
  // Thunder / Storm
  if (lower.includes('thunder') || lower.includes('storm')) {
    return {
      image: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800&q=80',
      gradient: 'linear-gradient(135deg, rgba(26, 26, 62, 0.7) 0%, rgba(45, 27, 78, 0.7) 100%)',
      overlay: 'rgba(0,0,0,0.4)',
    }
  }
  
  // Snow
  if (lower.includes('snow')) {
    return {
      image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80',
      gradient: 'linear-gradient(135deg, rgba(224, 231, 255, 0.3) 0%, rgba(199, 210, 254, 0.3) 100%)',
      overlay: 'rgba(0,0,0,0.1)',
    }
  }
  
  // Default - nice blue sky
  return {
    image: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&q=80',
    gradient: 'linear-gradient(135deg, rgba(26, 41, 128, 0.4) 0%, rgba(38, 208, 206, 0.4) 100%)',
    overlay: 'rgba(0,0,0,0.15)',
  }
}

const MainWeatherCard = ({ weather }) => {
  const tempRef = useRef(null)
  const iconRef = useRef(null)
  const cardRef = useRef(null)

  const bg = getWeatherBackground(weather.condition)

  useEffect(() => {
    // Animate temperature counting
    if (tempRef.current) {
      gsap.fromTo(tempRef.current,
        { innerHTML: 0 },
        {
          innerHTML: Math.round(weather.temperature_f),
          duration: 1.5,
          ease: "power2.out",
          snap: { innerHTML: 1 },
          onUpdate: function() {
            if (tempRef.current) {
              tempRef.current.innerHTML = Math.round(this.targets()[0].innerHTML)
            }
          }
        }
      )
    }

    // Animate weather icon
    if (iconRef.current) {
      gsap.fromTo(iconRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, ease: "elastic.out(1, 0.5)" }
      )
    }
  }, [weather])

  const now = new Date()
  const dateString = now.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })

  const conditionText = weather.condition?.replace(/[^\w\s]/g, '').trim() || 'Clear'

  return (
    <Paper
      ref={cardRef}
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      sx={{
        p: 3,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 320,
      }}
    >
      {/* Background Image */}
      <Box
        component={motion.div}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bg.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      
      {/* Gradient Overlay */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: bg.gradient,
        zIndex: 1,
      }} />
      
      {/* Dark overlay for text readability */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: bg.overlay,
        zIndex: 2,
      }} />

      {/* Animated particles for sunny weather */}
      {(weather.condition?.toLowerCase().includes('clear') || weather.condition?.toLowerCase().includes('sunny')) && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 3,
        }}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -100],
                x: [0, Math.random() * 30 - 15],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
              style={{
                position: 'absolute',
                left: `${10 + Math.random() * 80}%`,
                bottom: '10%',
                fontSize: 16,
              }}
            >
              ✨
            </motion.div>
          ))}
        </Box>
      )}

      {/* Rain drops for rainy weather */}
      {(weather.condition?.toLowerCase().includes('rain') || weather.condition?.toLowerCase().includes('drizzle')) && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 3,
        }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 350],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: 0,
                width: 2,
                height: 15,
                backgroundColor: 'rgba(255,255,255,0.4)',
                borderRadius: 2,
              }}
            />
          ))}
        </Box>
      )}

      {/* Weather Icon */}
      <Box
        ref={iconRef}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          fontSize: 72,
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))',
          zIndex: 10,
        }}
      >
        {getWeatherIcon(weather.condition)}
      </Box>

      {/* Temperature & Info */}
      <Box sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            ref={tempRef}
            sx={{
              fontSize: '6rem',
              fontWeight: 300,
              lineHeight: 1,
              textShadow: '0 4px 30px rgba(0,0,0,0.4)',
            }}
          >
            {Math.round(weather.temperature_f)}
          </Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 300, mt: 1, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>°F</Typography>
        </Box>

        {/* Condition */}
        <Typography variant="h6" sx={{ 
          opacity: 0.95, 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}>
          {getWeatherIcon(weather.condition)} {conditionText}
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationOn sx={{ fontSize: 20, opacity: 0.9 }} />
          <Typography variant="body1" sx={{ textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
            {weather.city}{weather.country ? `, ${weather.country}` : ''}
          </Typography>
        </Box>

        {/* Date & Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 18, opacity: 0.9 }} />
          <Typography variant="body2" sx={{ opacity: 0.9, textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
            {dateString} <strong>{timeString}</strong>
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default MainWeatherCard
