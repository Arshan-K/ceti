const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');

require("dotenv").config();

app.use(express.static(path.join(__dirname, '../public')));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database!");
  }
});

app.use(cors());

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Define an HTML template for displaying data
const dataTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
      margin: 0;
      padding: 0;
    }
    h1 {
      background-color: #3498db;
      color: #fff;
      padding: 10px;
    }
    p {
      margin: 10px;
      padding: 5px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>Data</h1>
  <p>Certificate Number: {{Certificate_Number}}</p>
  <p>Name: {{Name}}</p>
  <p>Designation: {{Designation}}</p>
  <p>Institute: {{Institute}}</p>
  <p>Workshop Organiser: {{Workshop_Organiser}}</p>
  <p>Workshop Name: {{Workshop_Name}}</p>
  <p>Workshop Date: {{Workshop_Date}}</p>
</body>
</html>
`;

app.get('/getData', (req, res) => {
  const Reference_Number = req.query.rid;

  if (!Reference_Number) {
    return res.status(400).send('Bad Request');
  }

  const sql = 'SELECT * FROM data WHERE `Reference_Number` = ?';
  connection.query(sql, [Reference_Number], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      return res.status(404).send('Data not found');
    }

    const data = results[0];
    const renderedTemplate = dataTemplate.replace(
      /{{(.*?)}}/g,
      (match, key) => data[key.trim()]
    );

    res.send(renderedTemplate);
  });
});

app.get('*', (req, res) => {
  console.log("Not working");
  res.status(404).send('Page Not Found');
});

const myHTTP_PORT = process.env.HTTP_PORT;
const MYSQL_PORT = process.env.DB_PORT;

app.listen(myHTTP_PORT, () => {
  console.log(`HTTP Server is running on port ${myHTTP_PORT}`);
});
