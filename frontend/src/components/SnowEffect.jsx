import React, { useEffect, useRef } from 'react'
import { Box } from '@mui/material'

const SnowEffect = ({ intensity = 1 }) => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationId
    let snowflakes = []
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    // Create snowflakes
    const createSnowflakes = () => {
      const count = 150 * intensity
      snowflakes = []
      for (let i = 0; i < count; i++) {
        snowflakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.5,
          wind: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.6 + 0.4,
        })
      }
    }
    createSnowflakes()
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      snowflakes.forEach(flake => {
        // Update position
        flake.y += flake.speed
        flake.x += flake.wind + Math.sin(flake.y * 0.01) * 0.5
        
        // Reset if out of bounds
        if (flake.y > canvas.height) {
          flake.y = -10
          flake.x = Math.random() * canvas.width
        }
        if (flake.x > canvas.width) flake.x = 0
        if (flake.x < 0) flake.x = canvas.width
        
        // Draw snowflake
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`
        ctx.fill()
        
        // Add glow effect
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.2})`
        ctx.fill()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [intensity])
  
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  )
}

export default SnowEffect
