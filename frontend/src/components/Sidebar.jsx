import React from 'react'
import { Box, IconButton, Avatar, Tooltip, Badge } from '@mui/material'
import { 
  Dashboard, BarChart, LocationOn, Notifications, 
  Settings, CloudQueue, CalendarMonth, WbSunny 
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const menuItems = [
  { icon: Dashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: BarChart, label: 'Analytics', id: 'analytics' },
  { icon: LocationOn, label: 'Locations', id: 'locations' },
  { icon: CalendarMonth, label: 'Calendar', id: 'calendar' },
  { icon: Settings, label: 'Settings', id: 'settings' },
]

const Sidebar = ({ activeTab, setActiveTab, connected }) => {
  return (
    <Box
      component={motion.div}
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      sx={{
        width: 80,
        minHeight: '100vh',
        background: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        gap: 2,
      }}
    >
      {/* Logo */}
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #6C63FF 0%, #00D9FF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}>
          <WbSunny sx={{ color: 'white', fontSize: 28 }} />
        </Box>
      </motion.div>

      {/* Connection Status */}
      <Tooltip title={connected ? "Bedrock Connected" : "Disconnected"} placement="right">
        <Badge 
          color={connected ? "success" : "error"} 
          variant="dot"
          sx={{ mb: 2 }}
        >
          <CloudQueue sx={{ color: 'text.secondary', fontSize: 24 }} />
        </Badge>
      </Tooltip>

      {/* Menu Items */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.id} title={item.label} placement="right">
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                color: activeTab === item.id ? 'primary.main' : 'text.secondary',
                bgcolor: activeTab === item.id ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(108, 99, 255, 0.1)',
                },
              }}
            >
              <item.icon />
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      {/* Notifications */}
      <Tooltip title="Notifications" placement="right">
        <IconButton
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          sx={{ color: 'text.secondary' }}
        >
          <Badge badgeContent={3} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* User Avatar */}
      <motion.div whileHover={{ scale: 1.1 }}>
        <Avatar
          src="https://i.pravatar.cc/150?img=33"
          sx={{ 
            width: 44, 
            height: 44,
            border: '2px solid',
            borderColor: 'primary.main',
            cursor: 'pointer',
          }}
        />
      </motion.div>
    </Box>
  )
}

export default Sidebar
