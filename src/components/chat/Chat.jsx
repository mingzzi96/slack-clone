import { Divider, Grid, List, Paper, Toolbar } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import ChatHeader from './ChatHeader'
import { useSelector } from 'react-redux'
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import "../../firebase";
import { child, get, getDatabase, onChildAdded, orderByChild, query, ref, startAt } from 'firebase/database';

function Chat() {
    const {channel, user} = useSelector((state)=>state);
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef();

    useEffect(()=>{
        // 채널 정보 없으면 Return해줄 가드
        if(!channel.currentChannel) return;
            async function getMessage(){
            // 이미 저장되어있는 메시지를 불러온다.
            const snapShot = await get(child(ref(getDatabase()), "messages/"+channel.currentChannel.id));
            // value값이 있으면 가져오고 아니면 빈 array
            setMessages(snapShot.val() ? Object.values(snapShot.val()) : [])
        }
        getMessage()
        // 계속 메시지가 쌓이면 안되니까 clean-up 함수를 이용하여 unmount 되었을 때는 message를 비워주자
        return () => {
            setMessages([]);
        }
    },[channel.currentChannel])

    useEffect(()=>{
        // 가드를 여기도 넣어주세용
        if (!channel.currentChannel) return;
        const sorted = query(
            ref(getDatabase(), "messages/" + channel.currentChannel.id),
            orderByChild("timestamp")
          );
        // 해당 데이터베이스에 데이터들이 추가되면 이벤트를 받을 수 있는 메서드 onChildAdded
        // onChildAdded 메서드 사용하면 이전/현재 추가된 메시지가 100개면 100개를 순차적으로 콜백해서 다 가져올 수 있다.
        // 그 때마다 setMessages해줘버리면 성능이 느려질게 뻔함
        // 그래서 timestamp 시간순으로 정렬해 주고 그 정렬된 메시지들 중에서 현재 시점을 기준으로 추가된 애를 가져오게 해준다.
        const unsubscribe = onChildAdded(
            query(sorted, startAt(Date.now())),
            (snapshot) =>
              setMessages((oldMessages) => [...oldMessages, snapshot.val()])
          );
        return () => {
            // 가드에 걸리면 호출안될 수 있으니까 optional chaining
            unsubscribe?.();
        }
    },[channel.currentChannel])

    useEffect(()=>{
        const setTimeoutId = setTimeout(() => {
            messageEndRef.current.scrollIntoView({behavior:"smooth"});
        }, 1000)
        // 새 메시지가 여러개 연속으로 온다면 계속 실행이 반복적으로 될테니까
        // 1초 안에 다시 실행되면 clearTimeout 해준다.
        return () => {
            clearTimeout(setTimeoutId)
        }
    },[messages.length])


  return (
    <>
    <Toolbar/>
    <ChatHeader channelInfo={channel.currentChannel}/>
    <Grid container component={Paper} variant='outlined' sx={{mt:3, position:"relative"}}>
        <List sx={{height:"calc(100vh - 350px)", overflow:"scroll", width:"100%", position:"relative"}}>
            {messages.map(message => (
              <ChatMessage key={message.timestamp} message={message} user={user}/>
            ))}
            <div ref={messageEndRef}></div>
        </List>
        <Divider/>
        {/* 채팅 메시지 입력 인풋 */}
        <ChatInput/>
    </Grid>
    </>
  )
}

export default Chat
