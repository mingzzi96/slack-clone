import { Grid, IconButton, InputAdornment, LinearProgress, TextField } from '@mui/material'
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"
import ImageIcon from "@mui/icons-material/Image"
import SendIcon from "@mui/icons-material/Send";
import React, { useCallback, useState } from 'react'
import "../../firebase";
import { getDatabase, push, ref, serverTimestamp, set } from 'firebase/database';
import { useSelector } from 'react-redux';
import { Picker } from 'emoji-mart';
import "emoji-mart/css/emoji-mart.css";
import ImageModal from '../modal/ImageModal';

function ChatInput() {
    const {channel, user} = useSelector(state=>state);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [percent, setPercent] = useState(0);

    const handleClickOpen = useCallback(() => setImageModalOpen(true), []);
    const handleClickClose = useCallback(() => setImageModalOpen(false),[]);

    const handleTogglePicker = useCallback(() => setShowEmoji((show) => !show),[]);

    const handleChange = useCallback((e) => setMessage(e.target.value),[]);

    const createMessage = useCallback( () => ({
        timestamp:serverTimestamp(), 
        user: {
            id:user.currentUser.uid, 
            name:user.currentUser.displayName, 
            avatar:user.currentUser.photoURL
        },
        content: message
    }),[message, user.currentUser.uid,user.currentUser.displayName,user.currentUser.photoURL]);
    const clickSnedMessage = useCallback( async () => {
        if(!message) return;
        setLoading(true);
        try {
            // messages 하위에 저장할거고, key는 현재 채널의 Id를 넣어주겟다.
            await set(
                push(ref(getDatabase(), "messages/"+channel.currentChannel.id)),
                createMessage()
            )
            setLoading(false);
            setMessage("");
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    },[message,channel.currentChannel?.id,createMessage])

    const handleSelectEmoji = useCallback((e) => {
        // 선택된 이모지를 받아와서 파싱해준 다음 input에 넣어줄 예정
        const sym = e.unified.split("-");
        const codesArray = [];
        sym.forEach(el => codesArray.push("0x"+el));
        // String.fromCodePoint 는 코드값을 사용해서 그 코드에 해당하는 특정 문자열이나 이모티콘을 반환한다.
        const emoji = String.fromCodePoint(...codesArray);
        // 그러고 setMessage에 기존 message인 messageValue를 받아와서 뒤에 추가해준다.
        setMessage((messageValue) => messageValue+emoji)
    },[])
  return (
    <>
    <Grid container sx={{p:"20px"}}>
        <Grid item xs={12} sx={{position:"relative"}}>
            {showEmoji && (
                // emoji="point_up"은 point_up이라는 이모지가 기본으로 선택되어진 상태
                // set 옵션에는 원하는 이모지 스타일 지정 가능
                <Picker 
                    set="apple" 
                    className="emojipicker" 
                    title='이모지 선택' 
                    emoji='point_up' 
                    style={{position:"absolute",bottom:"80px"}} 
                    onSelect={handleSelectEmoji}
                />
            )}
           <TextField InputProps={{
                // 인풋 앞쪽에 아이콘 삽입
                startAdornment:(
                    <InputAdornment position='start'>
                        <IconButton onClick={handleTogglePicker}>
                            <InsertEmoticonIcon/>
                        </IconButton>
                        <IconButton onClick={handleClickOpen}>
                            <ImageIcon/>
                        </IconButton>
                    </InputAdornment>
                ),
                // 인풋 끝쪽에 아이콘 삽입
                endAdornment:(
                    <InputAdornment position='start'>
                        <IconButton disabled={loading} onClick={clickSnedMessage}>
                            <SendIcon/>
                        </IconButton>
                    </InputAdornment>
                ),
            }} 
            autoComplete='off'
            label="메시지를 입력해 보세요."
            fullWidth
            value={message}
            onChange={handleChange}
            /> 
            {uploading ? 
            <Grid item xs={12} sx={{m:"10px"}}>
                <LinearProgress variant='determinate' value={percent} />
            </Grid>
            : null}
            <ImageModal 
                handleClose={handleClickClose} 
                open={imageModalOpen} 
                setPercent={setPercent} 
                setUploading={setUploading}
            />
        </Grid>
    </Grid>
    </>
  )
}

export default ChatInput
