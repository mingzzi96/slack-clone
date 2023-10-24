import { Avatar, Grid, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'

const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

function ChatMessage({message, user}) {
    // 메시지가 텍스트인지 이미지인지 구분해주기
    const isImage = (message) => message.hasOwnProperty("image");
  return (
    <>
    <ListItem>
        <ListItemAvatar sx={{alignSelf:"stretch"}}>
            <Avatar 
            variant='rounded' 
            sx={{width:50, height:50}} 
            alt='profile image'
            src={message.user.avatar}
            />
        </ListItemAvatar>
        <Grid container sx={{ml:2}}>
            <Grid item xs={12} sx={{display:"flex", justifyContent:"left"}}>
                <ListItemText 
                sx={{display:"flex"}} 
                primary={message.user.name} 
                primaryTypographyProps={{fontWeight:"bold", color:message.user.id === user.currentUser.uid ? "orange" : "black"}} // 본인 메시지는 orange
                secondary={dayjs(message.timestamp).fromNow()} // 시간이 아니라 day.js 사용해서 몇초전, 몇시간전으로 보여줄 예정(fromNow메서드)
                secondaryTypographyProps={{color:"gray", ml:1}}
                />
            </Grid>
            <Grid item xs={12}>
                {
                    isImage(message) ? <img src={message.image} alt="message" style={{maxWidth:"100%"}} /> :
                    <ListItemText align="left" sx={{wordBreak:"break-all"}} primary={message.content} />
                }
            </Grid>
        </Grid>
    </ListItem>
    </>
  )
}

export default ChatMessage
