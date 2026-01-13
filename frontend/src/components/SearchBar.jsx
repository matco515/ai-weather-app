import React, { useState } from 'react'
import { Box, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material'
import { Search, MyLocation } from '@mui/icons-material'
import { motion } from 'framer-motion'

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
      }}
    >
      <TextField
        fullWidth
        placeholder="Search for cities..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={20} color="primary" />
              ) : (
                <Search sx={{ color: 'text.secondary' }} />
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(26, 26, 46, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(108, 99, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
      <IconButton
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSearch}
        disabled={loading}
        sx={{
          width: 52,
          height: 52,
          borderRadius: 3,
          bgcolor: 'primary.main',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <Search />
      </IconButton>
      <IconButton
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        sx={{
          width: 52,
          height: 52,
          borderRadius: 3,
          bgcolor: 'rgba(26, 26, 46, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.2)' },
        }}
      >
        <MyLocation />
      </IconButton>
    </Box>
  )
}

export default SearchBar
