import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Box, Avatar, Typography, Grid, TextField, Alert } from '@mui/material';
import TagIcon from "@mui/icons-material/Tag";
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import "../firebase";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorRef = useRef();
  const [notAllow, setNotAllow] = useState(true);
  const handleEmail = (event) => {
    setEmail(event.target.value);
  }
  const handlePassword = (event) => {
    setPassword(event.target.value);
  }
  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    try{
      await signInWithEmailAndPassword(getAuth(), email, password);
    }catch(e){
      console.log(e, e.code);
      if (e.code === 'auth/invalid-email') {
        setError('이메일 형식을 확인해 주세요!');
      }else if (e.code === 'auth/user-not-found') {
        setError('존재하지 않는 아이디입니다.');
      }else if (e.code === 'auth/wrong-password') {
        setError('비밀번호를 다시 확인해주세요');
      }else if (e.code === 'auth/too-many-requests') {
        setError('잠시 후 다시 시도해 주세요');
      }else if (e.code === 'auth/invalid-login-credentials') {
        setError("비밀번호를 다시 확인해주세요.")
      }
      setLoading(false);
    }
  },[])

  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    console.log(email, password)

    loginUser(email, password);
  },[email, password, loginUser])

  useEffect(() => {
    if(!email || !password){
      setError("모든 항목을 입력해 주세요.");
      setNotAllow(true);
      return;
    }
    setNotAllow(false);
  }, [email,password])

  useEffect(() => {
      setError("")
  },[email,password])
  return (
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
              <Typography component="h1" variant='h5'>로그인</Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt:3}}>
                  {error ? <Alert sx={{mt:"20px", mb:"24px"}} severity="error" ref={errorRef} aria-live="assertive">{error}</Alert> : null}
                  <TextField margin='normal' required fullWidth label="이메일 주소" name='email' autoComplete='off' autoFocus value={email} onChange={handleEmail}/>
                  <TextField margin='normal' required fullWidth label="비밀번호" name='password' autoComplete='off' type='password' value={password} onChange={handlePassword}/>
                  <LoadingButton type='submit' fullWidth variant='contained' color='secondary' disabled={notAllow} loading={loading} sx={{mt:3,mb:2}}>로그인</LoadingButton>
                  <Grid container justifyContent="flex-end">
                      <Grid item>
                          <Link to="/join" style={{textDecoration:"none",color:"blue"}}>계정이 없다면 회원가입해 보세요.</Link>
                      </Grid>
                  </Grid>
                  <Typography component='subtitle2' display="flex" justifyContent="flex-end" color="grey">테스트 ID : test@naver.com / 테스트 PW : test@1234</Typography>
              </Box>
      </Box>
    </Container>
  )
}
