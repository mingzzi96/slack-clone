import React, { useCallback, useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemIcon, Stack } from '@mui/material'
import PaletteIcon from "@mui/icons-material/Palette";
import { HexColorPicker } from 'react-colorful';
import "../../firebase";
import { child, getDatabase, push, ref, update, onChildAdded } from 'firebase/database';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../store/themeReducer';

function ThemeMenu() {
    const {user} = useSelector(state => state);
    const dispatch = useDispatch();
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [mainTheme, setMainTheme] = useState("#ffffff");
    const [subTheme, setSubTheme] = useState("#ffffff");
    const [userTheme, setUserTheme] = useState([]);

    const handleClickOpen = useCallback(() => setShowThemeModal(true),[]);
    const handleclose = useCallback(() => setShowThemeModal(false),[]);

    const handleChangeMain = useCallback( ((color) => setMainTheme(color)),[] )
    const handleChangeSub = useCallback( ((color) => setSubTheme(color)),[] )

    const handleSaveTheme = useCallback( async() => {
        if(!user.currentUser?.uid) return;
        try {
            // db 정보 가져온다
            const db = getDatabase()
            // 키와 경로 지정
            const key = push(child(ref(db), "/users/"+user.currentUser.uid+"/theme")).key;
            // 새로 지정될 테마 저장
            const newTheme = {mainTheme, subTheme};
            const updates = {};
            // theme 폴더 하위에 우리가 만든 키값에다가 새로 지정한 테마 넣는다
            updates["/users/"+user.currentUser.uid+"/theme/"+key] = newTheme;
            // 그리고 db에 update 해준다.
            await update(ref(db), updates);
            // update 되면 닫는다.
            handleclose();
        } catch (error) {
            console.error(error)
            handleclose();
        }
    },[handleclose, mainTheme, subTheme, user.currentUser?.uid])

    useEffect(() => {
        if(!user.currentUser.uid) return;
        const db = getDatabase();
        const themeRef = ref(db, "users/"+user.currentUser.uid+"/theme");
        // 이전 저장된 정보도 가져오고 새로 등록된 데이터도 이벤트 발생시켜 준다.
        const unsubscribe = onChildAdded(themeRef, (snap) => {
            setUserTheme((themeArr) => [snap.val(), ...themeArr]);
        })
        return () => {
            // 계속해서 데이터가 쌓이기만 하면 안되니까 unmount 될 때 state 비워주기
            setUserTheme([]);
            unsubscribe?.();
        }
    },[user.currentUser.uid])
  return (
    <>
    <List sx={{overflow:"auto", width:60, backgroundColor:"#150C16"}}>
        <ListItem button onClick={handleClickOpen}>
            <ListItemIcon sx={{color:"white"}}>
                <PaletteIcon/>
            </ListItemIcon>
        </ListItem>
        {/* 추가되는 테마들이 보이는 영역 */}
        {userTheme.map((theme, i)=>(
            <ListItem key={i}>
                <div className='theme-box' onClick={()=>dispatch(setTheme(theme.mainTheme, theme.subTheme))}>
                    <div className='theme-main' style={{backgroundColor:theme.mainTheme}}></div>
                    <div className='theme-sub' style={{backgroundColor:theme.subTheme}}></div>
                </div>
            </ListItem>
        ))}
    </List>
    <Dialog open={showThemeModal} onClose={handleclose}>
        <DialogTitle>테마 색상 선택하기</DialogTitle>
        <DialogContent>
            <Stack direction="row" spacing={2}>
                <div>
                    main
                    <HexColorPicker color={mainTheme} onChange={handleChangeMain} />
                </div>
                <div>
                    sub
                    <HexColorPicker color={subTheme} onChange={handleChangeSub} />
                </div>
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleclose}>취소</Button>
            <Button onClick={handleSaveTheme}>테마 저장</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default ThemeMenu
