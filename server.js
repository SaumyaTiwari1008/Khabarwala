
const express = require('express');
const dotenv = require('dotenv'); 
const path = require('path');
const cors = require("cors");

const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set('views', path.join(__dirname, 'views')); 
app.use('/uploads', express.static('uploads'));
var corsOptions = {
  origin: "http://localhost:8081"
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Import your controller
app.get("/", (req, res) => {
  res.json({ message: "Welcome." });
});

require("./routes/project.routes.js")(app);

// Start the server
const PORT = process.env.PORT || 3005;

app.listen(3005, () => {
  console.log(`Server is running on port 3005`);
});
