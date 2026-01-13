import React from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'

// Cloud SVG with realistic fluffy shape
const CloudShape = ({ size = 200, opacity = 0.9, blur = 0 }) => (
  <svg 
    width={size} 
    height={size * 0.6} 
    viewBox="0 0 200 120" 
    style={{ filter: blur > 0 ? `blur(${blur}px)` : 'none' }}
  >
    <defs>
      <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity={opacity} />
        <stop offset="100%" stopColor="#e0e0e0" stopOpacity={opacity * 0.8} />
      </linearGradient>
      <filter id="cloudShadow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15"/>
      </filter>
    </defs>
    <g filter="url(#cloudShadow)">
      <ellipse cx="60" cy="70" rx="50" ry="35" fill="url(#cloudGrad)" />
      <ellipse cx="100" cy="55" rx="45" ry="40" fill="url(#cloudGrad)" />
      <ellipse cx="140" cy="65" rx="40" ry="30" fill="url(#cloudGrad)" />
      <ellipse cx="80" cy="50" rx="35" ry="30" fill="url(#cloudGrad)" />
      <ellipse cx="120" cy="45" rx="30" ry="28" fill="url(#cloudGrad)" />
      <ellipse cx="155" cy="55" rx="25" ry="22" fill="url(#cloudGrad)" />
      <ellipse cx="45" cy="60" rx="28" ry="22" fill="url(#cloudGrad)" />
    </g>
  </svg>
)

// Dark storm cloud
const StormCloud = ({ size = 250, opacity = 0.95 }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 250 150">
    <defs>
      <linearGradient id="stormGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5a5a6e" stopOpacity={opacity} />
        <stop offset="50%" stopColor="#3a3a4a" stopOpacity={opacity} />
        <stop offset="100%" stopColor="#2a2a3a" stopOpacity={opacity * 0.9} />
      </linearGradient>
      <filter id="stormShadow">
        <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.4"/>
      </filter>
    </defs>
    <g filter="url(#stormShadow)">
      <ellipse cx="70" cy="90" rx="60" ry="45" fill="url(#stormGrad)" />
      <ellipse cx="125" cy="70" rx="55" ry="50" fill="url(#stormGrad)" />
      <ellipse cx="180" cy="85" rx="50" ry="40" fill="url(#stormGrad)" />
      <ellipse cx="100" cy="60" rx="45" ry="40" fill="url(#stormGrad)" />
      <ellipse cx="150" cy="55" rx="40" ry="38" fill="url(#stormGrad)" />
      <ellipse cx="200" cy="70" rx="35" ry="30" fill="url(#stormGrad)" />
      <ellipse cx="50" cy="80" rx="35" ry="28" fill="url(#stormGrad)" />
    </g>
  </svg>
)

const FloatingClouds = ({ weatherType = 'clear' }) => {
  const isStormy = weatherType.includes('storm') || weatherType.includes('thunder')
  const isRainy = weatherType.includes('rain') || weatherType.includes('drizzle')
  const isCloudy = weatherType.includes('cloud') || weatherType.includes('overcast')
  
  // Cloud configurations based on weather
  const clouds = isStormy ? [
    { id: 1, x: -5, y: 5, size: 350, duration: 45, delay: 0, Component: StormCloud },
    { id: 2, x: 30, y: 2, size: 400, duration: 50, delay: 5, Component: StormCloud },
    { id: 3, x: 60, y: 8, size: 320, duration: 40, delay: 10, Component: StormCloud },
    { id: 4, x: 85, y: 3, size: 280, duration: 55, delay: 15, Component: StormCloud },
  ] : (isCloudy || isRainy) ? [
    { id: 1, x: -10, y: 5, size: 280, duration: 60, delay: 0, opacity: 0.85, Component: CloudShape },
    { id: 2, x: 20, y: 10, size: 320, duration: 70, delay: 8, opacity: 0.8, Component: CloudShape },
    { id: 3, x: 50, y: 3, size: 250, duration: 55, delay: 4, opacity: 0.9, Component: CloudShape },
    { id: 4, x: 75, y: 12, size: 300, duration: 65, delay: 12, opacity: 0.75, Component: CloudShape },
  ] : [
    // Lighter clouds for partly cloudy / clear with some clouds
    { id: 1, x: 10, y: 8, size: 180, duration: 80, delay: 0, opacity: 0.6, blur: 2, Component: CloudShape },
    { id: 2, x: 60, y: 5, size: 200, duration: 90, delay: 10, opacity: 0.5, blur: 3, Component: CloudShape },
  ]

  // Don't show clouds for completely clear weather
  if (weatherType.includes('clear') && !weatherType.includes('partly')) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 4, // Behind cards (z-index 10) but above background
      }}
    >
      {clouds.map(cloud => {
        const { Component, ...props } = cloud
        return (
          <Box
            key={cloud.id}
            component={motion.div}
            initial={{ x: `${cloud.x}vw`, y: `${cloud.y}vh` }}
            animate={{
              x: [`${cloud.x}vw`, `${cloud.x + 5}vw`, `${cloud.x}vw`],
              y: [`${cloud.y}vh`, `${cloud.y + 2}vh`, `${cloud.y}vh`],
            }}
            transition={{
              duration: cloud.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: cloud.delay,
            }}
            sx={{
              position: 'absolute',
            }}
          >
            <Component 
              size={cloud.size} 
              opacity={cloud.opacity || 0.9}
              blur={cloud.blur || 0}
            />
          </Box>
        )
      })}
    </Box>
  )
}

export default FloatingClouds
