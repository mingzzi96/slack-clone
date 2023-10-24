import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import TagIcon from "@mui/icons-material/Tag";
import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux';
import "../firebase"
import { getAuth, signOut } from 'firebase/auth';
import ProfileModal from './modal/ProfileModal';

export default function Header() {
    const {user, theme} = useSelector(state => state)
    const [anchorEl, setAnchorEl] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const handleOpenMenu = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    },[])
    const handleCloseMenu = useCallback(() => setAnchorEl(null),[]); 
    const handleLogout = useCallback(async () => {
        // signOut안에 누가 로그아웃을 할려는 건지 인증 정보를 가져와서 알려주자.
        await signOut(getAuth())
    },[])
    const handleClickOpen = useCallback(() => {
        setShowProfileModal(true);
        handleCloseMenu();
    },[handleCloseMenu])
    const handleCloseProfileModal = useCallback(() => {
        setShowProfileModal(false);
    },[])
  return (
    <>
    <AppBar position='fixed' sx={{zIndex:(theme) => theme.zIndex.drawer + 1, color:"#9A939B", backgroundColor:theme.mainTheme}}>
        <Toolbar sx={{display:"flex", justifyContent:"space-between", height:"50px"}}>
            <Box sx={{display:"flex"}}>
                <TagIcon/>
                <Typography variant='h6' component="div">
                    SLACK
                </Typography>
            </Box>
            <Box>
                <IconButton onClick={handleOpenMenu}>
                    <Typography variant='h6' component="div" sx={{color:"#9A939B"}}>
                        {user.currentUser?.displayName}
                    </Typography>
                    <Avatar sx={{marginLeft:"10px"}} alt='profileImage' src={user.currentUser?.photoURL}/>
                </IconButton>
                <Menu sx={{mt:"45px"}} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} anchorOrigin={{vertical:"top", horizontal:"right"}}>
                    <MenuItem>
                        <Typography onClick={handleClickOpen} textAlign="center">프로필이미지</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        <Typography textAlign="center">로그아웃</Typography>
                    </MenuItem>
                </Menu>
            </Box>
        </Toolbar>
    </AppBar>
    <ProfileModal open={showProfileModal} handleClose={handleCloseProfileModal}  />
    </>
  )
}
