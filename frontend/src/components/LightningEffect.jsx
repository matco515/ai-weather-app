import React, { useEffect, useRef } from 'react'
import { Box } from '@mui/material'

const LightningEffect = ({ intensity = 1 }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Lightning bolt generator
    const createLightningBolt = (startX, startY, endX, endY, displacement) => {
      const points = []
      points.push({ x: startX, y: startY })

      const generateBolt = (x1, y1, x2, y2, disp) => {
        if (disp < 5) {
          points.push({ x: x2, y: y2 })
          return
        }

        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2

        // Add randomness
        const offsetX = (Math.random() - 0.5) * disp
        const offsetY = (Math.random() - 0.5) * disp * 0.5

        const newMidX = midX + offsetX
        const newMidY = midY + offsetY

        generateBolt(x1, y1, newMidX, newMidY, disp / 2)
        generateBolt(newMidX, newMidY, x2, y2, disp / 2)
      }

      generateBolt(startX, startY, endX, endY, displacement)
      return points
    }

    const drawLightning = (points, alpha, width) => {
      if (points.length < 2) return

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }

      // Main bolt - bright white core
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Outer glow - blue tint
      ctx.strokeStyle = `rgba(180, 200, 255, ${alpha * 0.6})`
      ctx.lineWidth = width * 3
      ctx.filter = 'blur(3px)'
      ctx.stroke()

      // Wider glow
      ctx.strokeStyle = `rgba(100, 150, 255, ${alpha * 0.3})`
      ctx.lineWidth = width * 8
      ctx.filter = 'blur(8px)'
      ctx.stroke()

      ctx.filter = 'none'
    }

    // Lightning state
    let bolts = []
    let flashAlpha = 0
    let nextStrikeTime = Date.now() + Math.random() * 3000 / intensity

    const addBranches = (mainPoints, probability = 0.3) => {
      const branches = []
      for (let i = Math.floor(mainPoints.length * 0.2); i < mainPoints.length * 0.8; i++) {
        if (Math.random() < probability) {
          const point = mainPoints[i]
          const angle = (Math.random() - 0.5) * Math.PI * 0.8
          const length = 50 + Math.random() * 150
          const endX = point.x + Math.cos(angle + Math.PI / 2) * length
          const endY = point.y + length * 0.8
          branches.push(createLightningBolt(point.x, point.y, endX, endY, 30))
        }
      }
      return branches
    }

    const createStrike = () => {
      const startX = Math.random() * canvas.width
      const startY = 0
      const endX = startX + (Math.random() - 0.5) * 200
      const endY = canvas.height * (0.4 + Math.random() * 0.4)

      const mainBolt = createLightningBolt(startX, startY, endX, endY, 150)
      const branches = addBranches(mainBolt, 0.25)

      return {
        main: mainBolt,
        branches,
        alpha: 1,
        createdAt: Date.now(),
        duration: 150 + Math.random() * 100,
        flickerCount: 2 + Math.floor(Math.random() * 3),
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()

      // Check for new strike
      if (now >= nextStrikeTime) {
        bolts.push(createStrike())
        flashAlpha = 0.4
        nextStrikeTime = now + 2000 + Math.random() * 5000 / intensity
      }

      // Draw flash overlay
      if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        flashAlpha *= 0.85
        if (flashAlpha < 0.01) flashAlpha = 0
      }

      // Update and draw bolts
      bolts = bolts.filter(bolt => {
        const age = now - bolt.createdAt
        if (age > bolt.duration * (bolt.flickerCount + 1)) return false

        // Flicker effect
        const flickerPhase = Math.floor(age / bolt.duration)
        const phaseProgress = (age % bolt.duration) / bolt.duration

        if (flickerPhase <= bolt.flickerCount) {
          const alpha = (1 - phaseProgress) * (1 - flickerPhase * 0.3)

          if (alpha > 0) {
            // Draw main bolt
            drawLightning(bolt.main, alpha, 2)

            // Draw branches
            bolt.branches.forEach(branch => {
              drawLightning(branch, alpha * 0.7, 1)
            })
          }
        }

        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [intensity])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 5,
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

export default LightningEffect
