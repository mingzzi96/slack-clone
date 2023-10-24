import { Box, Drawer, Toolbar } from '@mui/material'
import React from 'react'
import Header from '../components/Header'
import ChannelMenu from '../components/menu/ChannelMenu'
import Chat from '../components/chat/Chat'
import ThemeMenu from '../components/menu/ThemeMenu'
import { useSelector } from 'react-redux'

export default function Main() {
  const {theme} = useSelector(state => state);

  return (
    <Box sx={{display:"flex", backgroundColor:theme.subTheme}}>
        <Header/>
        <Drawer variant='permanent' sx={{with:300}} className='no-scroll'>
            <Toolbar/>
            <Box sx={{display:"flex", minHeight:"calc(100vh - 64px)"}}>
                <ThemeMenu/>
                <ChannelMenu/>
            </Box>
        </Drawer>
        <Box component="main" sx={{flexGrow:1, pl:40, pt:"24px", pr:"24px", pb:"24px"}}>
            <Chat/>
        </Box>
    </Box>
  )
}
