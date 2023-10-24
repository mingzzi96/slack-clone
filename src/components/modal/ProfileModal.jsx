import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, Stack } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AvatarEditor from "react-avatar-editor";
import "../../firebase";
import { getDownloadURL, getStorage, ref as refStorage, uploadBytes } from "firebase/storage"
import { getDatabase, ref, update } from 'firebase/database';
import { useSelector } from 'react-redux';
import { updateProfile } from 'firebase/auth';

function ProfileModal({open, handleClose}) {
    const {user} = useSelector(state => state);
    const [previewImage, setPreviewImage] = useState("");
    const [croppedImage, setCroppedImage] = useState("");
    const [uploadedCroppedImage, setUploadedCroppedImage] = useState("");
    const [blob, setBlob] = useState("")
    const avatarEditorRef = useRef(null);

    const closeModal = useCallback(() => {
        handleClose();
        // 모달을 닫으면서 각 상태값 초기화시킨다.
        setPreviewImage("");
        setCroppedImage("");
        setUploadedCroppedImage("");
    },[handleClose])

    const handleChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener("load", () => {
          setPreviewImage(reader.result);
        });
    }, []);

    const handleCropImage = useCallback(() => {
        avatarEditorRef.current.getImageScaledToCanvas().toBlob((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          setCroppedImage(imageUrl);
          setBlob(blob);
        });
    }, []);

    const uploadCroppedImage = useCallback( async() => {
        // currentUser 정보 없는 경우 Return
        if(!user.currentUser?.uid) return;
        // storage 정보를 받아온다음 avatars/users 하위에 저장해준다.
        const storageRef = refStorage(getStorage(), `avatars/users/${user.currentUser.uid}`);
        // state로 가지고 있는 blob을 업로드 한다
        const uploadTask = await uploadBytes(storageRef, blob);
        // 업로드한 것의 download url을 가져온다
        const downloadUrl = await getDownloadURL(uploadTask.ref);
        // 새 URL을 state에 저장한다.
        setUploadedCroppedImage(downloadUrl);
    }, [blob, user.currentUser?.uid])

    // setUploadedCroppedImage가 변경됨을 감지하고 기존에 있는 프로필 이미지를 새 URL로 바꿔준다
    useEffect(() => {
        // 크롭된 이미지가 없거나 currentUser정보가  경우 Return
        if(!uploadedCroppedImage || !user.currentUser) return;
        async function changeAvatar(){
            // 현재 user의 photoURL을 새링크로 업뎃 해준다.
            await updateProfile(user.currentUser, {
                photoURL: uploadedCroppedImage
            });
            // 현재 user의 프로필 이미지 즉 avatar에도 업로드
            const updates = {}
            updates["/users/"+user.currentUser.uid+"/avatar"] = uploadedCroppedImage;
            await update(ref(getDatabase()), updates);
            // 프로필 업데이트 완료되면 모달 닫기
            closeModal();
        }
        changeAvatar()
    },[uploadedCroppedImage, user.currentUser,closeModal])
  return (
    <>
    <Dialog open={open} onClose={closeModal}>
        <DialogTitle>프로필 이미지 변경</DialogTitle>
        <DialogContent>
            <Stack direction="column" spacing={3}>
                <Input
                    type='file'
                    inputProps={{accept:"image/jpg, image/jpeg, image/png"}}
                    label="변경할 이미지 선택"
                    onChange={handleChange}
                />
                <div style={{display:"flex", alignItems:"center"}}>
                    {previewImage && (
                        <AvatarEditor
                            ref={avatarEditorRef}
                            image={previewImage}
                            width={120}
                            height={120}
                            border={50}
                            scale={2}
                            style={{ display: "inline" }}
                        />
                    )}
                    {croppedImage && (
                        <img
                            alt="cropped"
                            style={{ marginLeft: "50px" }}
                            width={100}
                            height={100}
                            src={croppedImage}
                            onClick={uploadCroppedImage}
                        />
                    )}
                </div>
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={closeModal}>취소</Button>
            {previewImage && (
                <Button onClick={handleCropImage}>이미지 자르기</Button>
            )}
            {croppedImage && (
                <Button onClick={uploadCroppedImage}>프로필로 설정하기</Button>
            )}
        </DialogActions>
    </Dialog>
    </>
  )
}

export default ProfileModal
