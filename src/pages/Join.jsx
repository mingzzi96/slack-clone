import { Container, Box, Avatar, Typography, Grid, TextField, Alert } from '@mui/material';
import TagIcon from "@mui/icons-material/Tag";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import "../firebase/index";
import {getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth"
import md5 from 'md5';
import { getDatabase, ref, set } from "firebase/database";
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userReducer';

export default function Join() {
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword ] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
    const [notAllow, setNotAllow] = useState(true);
    const [error, setError] = useState("");
    const errorRef = useRef();
    const [loading, setLoading] = useState(false);
    const USER_REGEX =
      /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    const PW_REGEX =
    /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+])(?!.*[^a-zA-z0-9$`~!@$!%*#^?&\\(\\)\-_=+]).{8,20}$/;
    const handleName = (e) => {
        setName(e.target.value);
    }
    const handleEmail = (e) => {
        setEmail(e.target.value);

        if(USER_REGEX.test(email)) {
            setEmailValid(true);
        } else {
            setEmailValid(false);
        }
    }
    const handlePassword = (e) => {
        setPassword(e.target.value);

        if(PW_REGEX.test(password)) {
            setPasswordValid(true);
        } else {
            setPasswordValid(false);
        }
    }
    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
    }
    useEffect(() => {
        if(password === confirmPassword && confirmPassword.length > 0){
            setConfirmPasswordValid(true)
        }else {
            setConfirmPasswordValid(false)
        }
    },[confirmPassword, password])
    useEffect(() => {
        if(emailValid && passwordValid && confirmPasswordValid && name.length > 0){
            setNotAllow(false);
            return;
        }
        setNotAllow(true);
    },[emailValid,passwordValid,confirmPasswordValid,name])

    const postUserData = useCallback( async (name, email, password) => {
        setLoading(true);
        try{
            const {user} = await createUserWithEmailAndPassword(getAuth(),email,password);
            await updateProfile(user, {
                displayName: name,
                photoURL: `https://www.gravatar.com/avatar/${md5(email)}?d=retro`
            })
            await set(ref(getDatabase(), "users/"+user.uid), {
                name: user.displayName,
                avatar: user.photoURL
            })
            // App 전체에서 setUser 해주고있지만 Join에서 한번 더 setUser 해줘야한다.
            // createUserWithEmailAndPassword하고나서 updateProfile하고있기 때문에 , updateProfile정보 없이 user 정보를 저장하고있기 때문!
            dispatch(setUser(user));
        }catch(e){
            if( e.code === "auth/email-already-in-use" ){
                setError("이미 사용중인 이메일 입니다.");
            }else if ( e.code === "weak-password" ){
                setError("비밀번호는 영문/특수문자 조합 8자 이상이어야 합니다.")
            }
            setLoading(false);
            errorRef.current.focus();
        }
    },[dispatch])

    const handleSubmit = useCallback( (e) => {
        e.preventDefault();
        // 혹시라도 오류로 버튼이 활성화 되었을때, 한번더 체크하여 잘못된 정보라면 return
        const v1 = USER_REGEX.test(email);
        const v2 = PW_REGEX.test(password);
        if( !v1 || !v2 ){
            setError("잘못된 접근입니다. 다시 시도해 주세요.")
            return;
        }

        if(!name || !email || !password || !confirmPassword){
            setError("모든 항목을 입력해주세요.")
            return;
        }
        
        postUserData(name, email, password)
    },[email, name, password, confirmPassword, PW_REGEX, USER_REGEX, postUserData])

    useEffect(() => {
        setError("")
    },[email,password,confirmPassword,name])
  return (
    <div>
      <Container component="main" maxWidth="xs">
        <Box sx={{
            display:"flex", 
            flexDirection: "Column", 
            alignItems:"center", 
            justifyContent:"center", 
            height:"100vh"}}>

                <Avatar sx={{m:1, bgcolor:"secondary.main"}}>
                    <TagIcon/>
                </Avatar>
                <Typography component="h1" variant='h5'>회원가입</Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt:3}}>
                    {error ? <Alert sx={{mt:"20px", mb:"24px"}} severity="error" ref={errorRef} aria-live="assertive">{error}</Alert> : null}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField name='name' required fullWidth label="닉네임" autoFocus onChange={handleName} value={name} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name='email' required fullWidth label="이메일 주소" autoComplete='off' onChange={handleEmail} value={email} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name='password' required fullWidth label="비밀번호" type='password' onChange={handlePassword} value={password} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name='confirmPassword' required fullWidth label="비밀번호 확인" type='password' onChange={handleConfirmPassword} value={confirmPassword} />
                        </Grid>
                    </Grid>
                    <LoadingButton type='submit' fullWidth variant='contained' color='secondary' disabled={notAllow} loading={loading} sx={{mt:3,mb:2}}>회원가입</LoadingButton>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link to="/login" style={{textDecoration:"none",color:"blue"}}>이미 계정이 있다면 로그인해 보세요.</Link>
                        </Grid>
                    </Grid>
                </Box>
        </Box>
      </Container>
    </div>
  )
}
