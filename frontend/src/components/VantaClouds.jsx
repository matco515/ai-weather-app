import React, { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import * as THREE from 'three'

const VantaClouds = ({ isDark = false }) => {
  const vantaRef = useRef(null)
  const [vantaEffect, setVantaEffect] = useState(null)

  useEffect(() => {
    // Dynamically import Vanta to avoid SSR issues
    const loadVanta = async () => {
      try {
        const VANTA = await import('vanta/dist/vanta.clouds.min')
        
        if (!vantaEffect && vantaRef.current) {
          const effect = VANTA.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            // Sunny day colors
            skyColor: isDark ? 0x1a1a2e : 0x68b8d7,
            cloudColor: isDark ? 0x3a3a5a : 0xadc1de,
            cloudShadowColor: isDark ? 0x0a0a1a : 0x183550,
            sunColor: 0xe1e1e1,
            sunGlareColor: isDark ? 0x2a2a4a : 0xff6633,
            sunlightColor: isDark ? 0x4a4a6a : 0xd9b491,
            speed: 1.0,
          })
          setVantaEffect(effect)
        }
      } catch (error) {
        console.log('Vanta loading error:', error)
      }
    }

    loadVanta()

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [isDark])

  // Update colors when isDark changes
  useEffect(() => {
    if (vantaEffect) {
      vantaEffect.setOptions({
        skyColor: isDark ? 0x1a1a2e : 0x68b8d7,
        cloudColor: isDark ? 0x3a3a5a : 0xadc1de,
        cloudShadowColor: isDark ? 0x0a0a1a : 0x183550,
        sunGlareColor: isDark ? 0x2a2a4a : 0xff6633,
        sunlightColor: isDark ? 0x4a4a6a : 0xd9b491,
      })
    }
  }, [isDark, vantaEffect])

  return (
    <Box
      ref={vantaRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}
    />
  )
}

export default VantaClouds
