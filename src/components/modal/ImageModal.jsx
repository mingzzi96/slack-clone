import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input } from '@mui/material'
import React, { useCallback, useState } from 'react'
import {v4 as uuidv4} from "uuid";
import "../../firebase";
import { getDownloadURL, getStorage, ref as refStorage, uploadBytesResumable } from "firebase/storage"
import { getDatabase, ref, push, serverTimestamp, set } from 'firebase/database';
import { useSelector } from 'react-redux';

function ImageModal({open, handleClose, setPercent, setUploading}) {
    const { channel, user } = useSelector((state) => state);
    const [file, setFile] = useState(null);
  
    const onChangeAddFile = useCallback((e) => {
        // 현재 추가된 파일 중에 첫번째 받아서 addedFile에 저장
      const addedFile = e.target.files[0];
      // file이 있을 경우에만 setFile 상태에 addedFile 저장
      if (addedFile) setFile(addedFile);
    }, []);

    const createImageMessage = useCallback((fileUrl)=>({
        timestamp: serverTimestamp(),
        user: {
          id: user.currentUser.uid,
          name: user.currentUser.displayName,
          avatar: user.currentUser.photoURL,
        },
        image: fileUrl,
    }),[
        user.currentUser.uid,
        user.currentUser.displayName,
        user.currentUser.photoURL,
    ])

    const uploadFile = useCallback(() => {
        setUploading(true);
        // 고유한 id를 지정해주는 uuid 설치필요 
        // $ npm i uuid
        // chat 폴더 하위에 uuidv4를 사용해서 고유 이름 부여해주고, file 이름 split해서 확장자만 가져와 붙여줌
        const filePath = `chat/${uuidv4()}.${file.name.split(".").pop()}`;
        const uploadTask = uploadBytesResumable(refStorage(getStorage(), filePath), file);
        // 상태가 바뀔때마다 얼마나 업로드 되는지 체크
        const unsubscribe = uploadTask.on("state_changed",(snap) => {
            const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes)*100);
            setPercent(percentUploaded);
        }, (error) => {
            setUploading(false);
            console.error(error)
        }, async()=>{
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await set(
                    push(ref(getDatabase(), "messages/"+channel.currentChannel?.id)), 
                    createImageMessage(downloadURL));
                    unsubscribe();
                    setUploading(false);
            } catch (error) {
                console.error(error)
                setUploading(false);
                unsubscribe();
            }
        })
    },[channel.currentChannel?.id, createImageMessage, file, setPercent, setUploading])

    const handleSendFile = useCallback(() => {
        uploadFile()
        // modal 닫아주기
        handleClose()
        // 파일 정보 초기화
        setFile(null)
    },[handleClose, uploadFile])

  return (
    <>
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>이미지 보내기</DialogTitle>
        <DialogContent>
            <Input 
                margin='dense' 
                inputProps={{accept:"image/jpg, image/jpeg, image/png, image/gif"}} 
                type='file'
                fullWidth
                variant="standard"
                onChange={onChangeAddFile}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>취소</Button>
            <Button onClick={handleSendFile}>전송</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default ImageModal
