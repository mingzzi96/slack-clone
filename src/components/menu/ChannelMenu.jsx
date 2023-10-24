import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, TextField } from '@mui/material'
import AddIcon from "@mui/icons-material/Add"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import "../../firebase"
import { child, getDatabase, onChildAdded, push, ref, update } from 'firebase/database';
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChannel } from '../../store/channelReducer'

const ChannelMenu = () => {
    const {theme} = useSelector(state => state);
    const [open, setOpen] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [channelDetail, setChannelDetail] = useState("");
    const [channels, setChannels] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [activeChannelId, setActiveChannelId] = useState("");
    const [firstLoaded, setFirstLoaded] = useState(true);
    const dispatch = useDispatch();
    useEffect(() => {
        // 마운트 다 된 다음에 데이터를 가져올 수 있도록
        const unsubscribe = onChildAdded(ref(getDatabase(), "channels"),(snapshot) => {
            setChannels((channelArr) => [...channelArr, snapshot.val()])
        });
        return () => {
            setChannels([]);
            unsubscribe();
        }
    }, [])
    const changeChannel = useCallback((channel) => {
        // 선택되어있는 id와 새로 선택된 id 값이 같으면 changeChannel 멈추도록 설정
        // 이거 안해주면 눌렀던거 또 클릭해도 dispatch가 계속 업데이트 된다.
        if(channel.id === activeChannelId) return;
        setActiveChannelId(channel.id)
        dispatch(setCurrentChannel(channel))
    },[activeChannelId,dispatch])
    const handleClickOpen = useCallback(() => setOpen(true),[]);
    const handleClose = useCallback(() => setOpen(false),[]);
    const handleChangeChannelName = useCallback((e) => setChannelName(e.target.value),[]);
    const handleChangeChannelDetail = useCallback((e) => setChannelDetail(e.target.value),[]);
    const handleSubmit = useCallback( async () => {
        const db = getDatabase();
        // channels 하위에 키를 생성하고 거기다 데이터를 저장하도록 한다.
        const key = push(child(ref(db), "channels")).key;
        const newChannel = {
            id:key,
            name:channelName,
            details:channelDetail,
        }
        const updates = {};
        updates["/channels/"+key] = newChannel;

        try{
            if(!channelName){
                setErrorMsg("제목 입력은 필수입니다.")
                return;
            }
            await update(ref(db), updates)
            setChannelName("")
            setChannelDetail("")
            handleClose();
        }catch(e){
            console.error(e)
        }
    },[channelDetail, channelName, handleClose])
    useEffect(() => {
        if(channels.length > 0 && firstLoaded){
            setActiveChannelId(channels[0].id); 
            setFirstLoaded(false)
            dispatch(setCurrentChannel(channels[0]))
        }
    },[channels, firstLoaded, dispatch])
    useEffect(()=>{
        if(channelName){
            setErrorMsg("");
        }
    },[channelName])
  return (
    <>
        <List sx={{overflow:"auto",width:240,backgroundColor:theme.mainTheme}}>
            <ListItem>
                <ListItemIcon sx={{color:"#9A939B"}}>
                    <ArrowDropDownIcon/>
                </ListItemIcon>
                <ListItemText primary="채널" sx={{wordBreak:"break-all", color:"#9A939B"}} />
                {/* ListItemSecondaryAction은 ListItem의 맨 마지막에 넣어야 오류가 안나니 주의 */}
                <ListItemSecondaryAction>
                    <IconButton sx={{color:"#9A939B"}} onClick={handleClickOpen}>
                        <AddIcon/>
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
            <List component="div" disablePadding sx={{pl:3}} >
                {
                    channels.map(channel => (
                        <ListItem button 
                        key={channel.id} 
                        selected={channel.id === activeChannelId}
                        onClick={()=>changeChannel(channel)}>
                            <ListItemText primary={`# ${channel.name}`} sx={{wordBreak:"break-all", color:"#918890"}} />
                        </ListItem>
                    ))
                }
            </List>
        </List>
        {/* modal component */}
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>채널 추가하기</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{mb:"12px"}}>
                    추가할 채널명과 설명을 입력해 주세요.
                </DialogContentText>
                { errorMsg ? <Alert aria-live='assertive' severity="error">{errorMsg}</Alert> : null }
                <TextField required autoFocus autoComplete='off' margin='dense' label="채널명" type='text' fullWidth variant='standard' onChange={handleChangeChannelName} />
                <TextField autoComplete='off' margin='dense' label="채널 설명" type='text' fullWidth variant='standard' onChange={handleChangeChannelDetail} />
                <DialogActions>
                    <Button onClick={handleClose}>취소</Button>
                    <Button onClick={handleSubmit}>추가하기</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </>
  )
}

export default ChannelMenu
