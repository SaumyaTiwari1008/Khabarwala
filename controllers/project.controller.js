require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserDetails = require('../models/project.model.js');
// const JWT_SECRETE_KEY = process.env.JWT_SECRETE_KEY || "practice_project";



exports.create = async (req, res) => {
  console.log("Request body:", req.body);
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  try {
    if (!req.body.password) {
      return res.status(400).json({ status: false, message: "Password is required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userdetails = new UserDetails({
      userid: req.body.userid,
      fullname: req.body.fullname,
      password: hashedPassword,
      email: req.body.email,
      mobno: req.body.mobno,
      state_id: req.body.state_id,
      city_id: req.body.city_id
    });
    console.log("User details to be saved:", userdetails);
    UserDetails.create(userdetails, (err, data) => {
      if (err) {
        res.status(500).json({ status: false, message: err.message || "Some error occurred while creating the user." });
      } else {
        res.status(200).json({ status: true, message: 'User created successfully', data: data });
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({
      message: "Internal Server Error"
    });
  }
};

exports.findOne = (req, res) => {
  UserDetails.findById(req.params.userid, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ status: false, message: `Not found User with id ${req.params.userId}.` });
      } else {
        res.status(500).json({ status: false, message: "Error retrieving User with id " + req.params.userId });
      }
    } else {
      res.status(200).json({ status: true, data: data });
    }
  });
};


exports.login=(req,res)=>{
  console.log(req.body);
  try {
    const { mobno, password } = req.body;

    if (!mobno || !password) {
      return res.status(400).json({ status: false, message: "mobno and password are required" });
    }

    let ser_data = { mob :mobno,pass:password   };
    
    UserDetails.findByMobileNumberAndPassword(ser_data, async (err, user) => {
      if (err) {
        return res.status(500).json({ status: false, message: "Error retrieving user" });
      }

      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      
      // const isMatch = await bcrypt.compare(password, ser_data.pass);
      // console.log(password);
      // console.log(ser_data.pass);
      // console.log(isMatch);
      // if (!isMatch) {
      //   return res.status(401).json({ status: false, message: "Invalid credentials" });
      // }

      // const { password, ...userDetails } = user;
        // console.log(user);
        // console.log("findByMobileNumberAndPassword");
        const token = jwt.sign(
          { mobno: user.mobno,pass:user.password },
          process.env.JWT_SECRETE_KEY,
          {expiresIn: process.env.JWT_EXPIRES_IN }
        );
        

      return res.status(200).json({ status: true, message: "Login successful", data: user });
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}