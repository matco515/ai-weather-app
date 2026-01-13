import React from 'react'
import { Box } from '@mui/material'

// Realistic water droplets effect - no lines, just droplets
const WaterDropletEffect = ({ active = true, count = 3 }) => {
  if (!active) return null
  
  // Generate random droplets - very minimal
  const droplets = React.useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 3,
    }))
  }, [])
  
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Water droplets - realistic glass effect */}
      {droplets.map((drop) => (
        <Box
          key={drop.id}
          sx={{
            position: 'absolute',
            left: `${drop.left}%`,
            top: `${drop.top}%`,
            width: drop.size,
            height: drop.size * 1.3,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.8) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(200,220,255,0.3) 0%, rgba(150,180,220,0.1) 100%)
            `,
            boxShadow: `
              inset 0 -${drop.size * 0.2}px ${drop.size * 0.3}px rgba(255,255,255,0.4),
              0 ${drop.size * 0.15}px ${drop.size * 0.25}px rgba(0,0,0,0.15)
            `,
            animation: `dropletFall ${drop.duration}s ease-in-out infinite`,
            animationDelay: `${drop.delay}s`,
            opacity: 0,
            transform: 'translateY(-20px)',
            '@keyframes dropletFall': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px)',
              },
              '10%': {
                opacity: 0.9,
              },
              '80%': {
                opacity: 0.9,
              },
              '100%': {
                opacity: 0,
                transform: `translateY(${50 + Math.random() * 100}px)`,
              },
            },
          }}
        />
      ))}
      
      {/* Condensation/fog effect on glass */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 35%),
            radial-gradient(ellipse at 50% 90%, rgba(200,220,255,0.05) 0%, transparent 30%)
          `,
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}

export default WaterDropletEffect
