import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux'; // createStore보다 configureStore 사용을 권장하지만 createStore를 계속 사용하고 싶다면 legacy_createstore사용
import rootReducer from './store';
import { composeWithDevTools } from 'redux-devtools-extension';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={legacy_createStore(rootReducer, composeWithDevTools())}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
