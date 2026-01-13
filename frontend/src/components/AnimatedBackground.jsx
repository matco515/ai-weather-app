import React, { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { gsap } from 'gsap'

const AnimatedBackground = () => {
  const containerRef = useRef(null)
  const cloudsRef = useRef([])

  useEffect(() => {
    // Create floating clouds animation with GSAP
    cloudsRef.current.forEach((cloud, i) => {
      if (cloud) {
        // Random starting position
        gsap.set(cloud, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.6,
        })
        
        // Continuous floating animation
        gsap.to(cloud, {
          x: `+=${100 + Math.random() * 200}`,
          y: `+=${-30 + Math.random() * 60}`,
          duration: 15 + Math.random() * 20,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 2
        })

        // Subtle scale pulse
        gsap.to(cloud, {
          scale: 1 + Math.random() * 0.3,
          duration: 8 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    })

    // Animate gradient orbs
    const orbs = containerRef.current?.querySelectorAll('.gradient-orb')
    orbs?.forEach((orb, i) => {
      gsap.to(orb, {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        duration: 20 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 3
      })
    })
  }, [])

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        zIndex: 0,
      }}
    >
      {/* Gradient Orbs */}
      <Box
        className="gradient-orb"
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        className="gradient-orb"
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        className="gradient-orb"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Floating Clouds */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          ref={el => cloudsRef.current[i] = el}
          sx={{
            position: 'absolute',
            fontSize: 40 + i * 15,
            opacity: 0.15 + (i % 3) * 0.1,
            filter: 'blur(1px)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {['☁️', '🌤️', '⛅', '🌥️', '🌦️', '🌈'][i]}
        </Box>
      ))}

      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <Box
          key={`star-${i}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: 2 + Math.random() * 2,
            height: 2 + Math.random() * 2,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.2); }
          }
        `}
      </style>
    </Box>
  )
}

export default AnimatedBackground
