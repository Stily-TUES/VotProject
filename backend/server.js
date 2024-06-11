const express = require('express');
const mariadb = require('mariadb');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const keycloak = new Keycloak({
  store: new session.MemoryStore()
}, {
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  bearerOnly: true,
  serverUrl: process.env.KEYCLOAK_URL,
  realm: process.env.KEYCLOAK_REALM,
  credentials: {
    secret: process.env.KEYCLOAK_SECRET
  }
});

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: new session.MemoryStore()
}));

app.use(keycloak.middleware());

app.get('/api/data', keycloak.protect(), async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM your_table");
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/data', keycloak.protect(), async (req, res) => {
  const { someData } = req.body;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query("INSERT INTO your_table (column_name) VALUES (?)", [someData]);
    conn.release();
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});