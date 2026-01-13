import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Box } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

// 3D Cloud PNG - fluffy white cloud with transparency
const CLOUD_IMAGE = 'https://pngimg.com/uploads/cloud/cloud_PNG24.png'

const StormEffect = ({ intensity = 1 }) => {
  const canvasRef = useRef(null)
  const [lightning, setLightning] = useState(false)
  const [lightningBolt, setLightningBolt] = useState(null)

  // Rain animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Rain drops
    const drops = []
    const numDrops = Math.floor(300 * intensity)
    
    for (let i = 0; i < numDrops; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 15,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    let animationId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw rain
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      
      drops.forEach(drop => {
        ctx.beginPath()
        ctx.globalAlpha = drop.opacity
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x + 1, drop.y + drop.length)
        ctx.stroke()
        
        drop.y += drop.speed
        drop.x += 0.5 // Slight wind
        
        if (drop.y > canvas.height) {
          drop.y = -drop.length
          drop.x = Math.random() * canvas.width
        }
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [intensity])

  // Lightning generator
  const generateLightningBolt = useCallback(() => {
    const points = []
    const startX = Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2
    let x = startX
    let y = 0
    const endY = window.innerHeight * (0.4 + Math.random() * 0.3)
    
    points.push({ x, y })
    
    while (y < endY) {
      y += Math.random() * 30 + 20
      x += (Math.random() - 0.5) * 80
      points.push({ x, y })
      
      // Branch
      if (Math.random() > 0.7) {
        const branchLength = Math.random() * 100 + 50
        const branchAngle = (Math.random() - 0.5) * Math.PI * 0.5
        points.push({
          x: x + Math.cos(branchAngle) * branchLength,
          y: y + Math.sin(branchAngle) * branchLength,
          branch: true,
        })
        points.push({ x, y, returnFromBranch: true })
      }
    }
    
    return points
  }, [])

  // Lightning flash effect
  useEffect(() => {
    if (intensity < 1.5) return // Only for storms
    
    const triggerLightning = () => {
      setLightningBolt(generateLightningBolt())
      setLightning(true)
      
      setTimeout(() => setLightning(false), 100)
      setTimeout(() => {
        setLightning(true)
        setTimeout(() => setLightning(false), 50)
      }, 150)
      
      setTimeout(() => setLightningBolt(null), 300)
    }
    
    // Initial lightning
    setTimeout(triggerLightning, 1000)
    
    // Random lightning
    const interval = setInterval(() => {
      if (Math.random() > 0.4) triggerLightning()
    }, 3000 + Math.random() * 4000)
    
    return () => clearInterval(interval)
  }, [intensity, generateLightningBolt])

  return (
    <>
      {/* 3D Cloud Image Layer - BEHIND cards but IN FRONT of background */}
      <Box
        sx={{
          position: 'fixed',
          top: '-5%',
          left: '-10%',
          width: '120%',
          zIndex: 5,
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      >
        <motion.img
          src={CLOUD_IMAGE}
          alt=""
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 0.85 }}
          transition={{ duration: 2 }}
          style={{
            width: '100%',
            filter: 'brightness(0.6) contrast(1.1)',
          }}
        />
      </Box>
      
      {/* Second cloud layer - adds depth */}
      <Box
        sx={{
          position: 'fixed',
          top: '-15%',
          right: '-20%',
          width: '80%',
          zIndex: 4,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      >
        <motion.img
          src={CLOUD_IMAGE}
          alt=""
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 0.6 }}
          transition={{ duration: 2.5, delay: 0.5 }}
          style={{
            width: '100%',
            filter: 'brightness(0.5) contrast(1.2) blur(2px)',
            transform: 'scaleX(-1)',
          }}
        />
      </Box>

      {/* Lightning flash overlay */}
      <AnimatePresence>
        {lightning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 30%, rgba(200, 220, 255, 0.4) 0%, transparent 70%)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Lightning bolt SVG */}
      <AnimatePresence>
        {lightningBolt && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9,
              pointerEvents: 'none',
            }}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={lightningBolt.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : p.returnFromBranch ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')}
              fill="none"
              stroke="#b8d4ff"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <path
              d={lightningBolt.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : p.returnFromBranch ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')}
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Rain canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

export default StormEffect
