import React from 'react'
import { Box, Chip, CircularProgress } from '@mui/material'
import { CheckCircle, Error, CloudQueue } from '@mui/icons-material'
import { motion } from 'framer-motion'

const ConnectionStatus = ({ connected }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Chip
          icon={
            connected === null ? (
              <CircularProgress size={14} color="inherit" />
            ) : connected ? (
              <CheckCircle sx={{ fontSize: 16 }} />
            ) : (
              <Error sx={{ fontSize: 16 }} />
            )
          }
          label={
            connected === null 
              ? "Checking connection..." 
              : connected 
                ? "Amazon Bedrock Connected" 
                : "Bedrock Disconnected"
          }
          color={connected === null ? "default" : connected ? "success" : "error"}
          variant="outlined"
          sx={{
            borderWidth: 2,
            '& .MuiChip-icon': {
              color: 'inherit'
            }
          }}
        />
        
        {connected && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Chip
              icon={<CloudQueue sx={{ fontSize: 16 }} />}
              label="Live Data"
              color="info"
              variant="outlined"
              sx={{ borderWidth: 2 }}
            />
          </motion.div>
        )}
      </Box>
    </motion.div>
  )
}

export default ConnectionStatus
