import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Join from './pages/Join';
import Login from './pages/Login';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser } from './store/userReducer';
import Main from './pages/Main';
import { CircularProgress, Stack } from '@mui/material';

function App() {
  const dispatch = useDispatch();
  const {isLoading, currentUser} = useSelector((state) => state.user);
  useEffect(()=>{
    // App 전체에서 user 로그인 여부 상태를 확인한다.
    // unsubscript해주는 이유는 렌더링 될때마다 아래 구문이 실행될텐데, 그럼 onAuthStateChanged가 계속해서 쌓이게 될것이다. 그걸 방지하기 위함임.
    const unsubscribe = onAuthStateChanged(getAuth(),(user)=>{
      if(!!user){ // user정보 있을때
        dispatch(setUser(user));
      }else { // user정보가 없거나 로그아웃일때
        dispatch(clearUser());
      }
    })
    return ()=>unsubscribe();
  },[dispatch])

  if(isLoading){
    return (
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress color='secondary' size={150} />
      </Stack>
    )
  }
  return (
    <Routes>
      <Route path='/' element={currentUser ? <Main/> : <Navigate to="/login"/>}/>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login/>} />
      <Route path="/join" element={currentUser ? <Navigate to="/" /> : <Join/>}/>
    </Routes>
  );
}

export default App;
