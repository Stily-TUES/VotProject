import Keycloak from 'keycloak-js';
import React, { useEffect, useState } from 'react';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/auth',
  realm: 'my-realm',
  clientId: 'my-client-id'
});

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
      setAuthenticated(authenticated);
    });
  }, []);

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My App</h1>
      <button onClick={() => keycloak.logout()}>Logout</button>
    </div>
  );
};

export default App;
