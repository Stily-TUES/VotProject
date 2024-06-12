import React, { useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import './App.css';

/*
  Init Options
*/
const initOptions = {
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
}

let kc = new Keycloak(initOptions);

kc.init({
  onLoad: 'login-required', // Supported values: 'check-sso' , 'login-required'
  checkLoginIframe: true,
}).then((auth) => {
  if (!auth) {
    console.error("Authentication Failed");
  } else {
    console.info("Authenticated");
    console.log('auth', auth)
    console.log('Keycloak', kc)
    console.log('Access Token', kc.token)

    kc.onTokenExpired = () => {
      console.log('token expired')
    }
  }
}, () => {
  console.error("Authentication Failed");
});

function App() {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  useEffect(() => {
    moveCircle();
  }, []);

  const handleClick = async () => {
    const newCount = await incrementCounter();
    setCount(newCount);
    moveCircle();
  };

  const moveCircle = () => {
    const top = Math.random() * 90 + '%';
    const left = Math.random() * 90 + '%';
    setPosition({ top, left });
  };

  const incrementCounter = async () => {
    const response = await fetch('http://localhost:5001/increment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: kc.token }),
    });
    const data = await response.json();
    return data.count;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clicker Game</h1>
        <p>Count: {count}</p>
        <div
          className="circle"
          style={{ top: position.top, left: position.left }}
          onClick={handleClick}
        ></div>
      </header>
    </div>
  );
}

export default App;
