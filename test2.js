const fetchData = () => {
  fetch('/api/data', {
    headers: {
      'Authorization': `Bearer ${keycloak.token}`
    }
  })
    .then(response => response.json())
    .then(data => console.log(data));
};

return (
  <div>
    <button onClick={fetchData}>Fetch Data</button>
  </div>
);
