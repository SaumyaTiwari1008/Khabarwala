
const sql = require("./db.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const UserDetails = function(userdetails) {
  this.userid = userdetails.userid;
  this.fullname = userdetails.fullname;
  this.password = userdetails.password;
  this.email = userdetails.email;
  this.mobno = userdetails.mobno;
  this.state_id = userdetails.state_id;
  this.city_id = userdetails.city_id;
};

UserDetails.create = (newUser, result) => {
  sql.query("INSERT INTO userdetails SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created user: ", { id: res.insertId, ...newUser });
    result(null, { id: res.insertId, ...newUser });
  });
};

UserDetails.findById = (userid, result) => {
  const query = `
    SELECT u.*, s.state_name, c.city_name
    FROM userdetails u
    JOIN states s ON u.state_id = s.state_id
    JOIN cities c ON u.city_id = c.city_id
    WHERE u.userid = ?
  `;
  sql.query(query, [userid], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
  
  

};


UserDetails.findByMobileNumberAndPassword = async (ser_data, result) => {

  getUsers(ser_data)
    .then((users) => {
      // console.log(users);
      // console.log(users.length);
      if (users.length > 0) {
        console.log(ser_data.pass);
        console.log(users[0].password);
        bcrypt.compare(ser_data.pass, users[0].password, (err, results) => {
          // console.log(results);
          if (err || !results) {
            console.log(results);
            result(err, { "status": false });
            return;
          }
          else {
            // If the password is correct, create and send the JWT token
            const token = jwt.sign({ mobno: users[0].mobno, pass: users[0].password }, process.env.JWT_SECRETE_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
            let return_data = {token, ...users[0] } ;

            // console.log("success on compare");
            // console.log(return_data);
            
            result(null, return_data);

          }


        });

      }
      else if (users.length == 0) {
        result(err, { "status": false });

      }
      else {
        console.log('failed');
        result(err, { "status": false });
        return;
      }
    })
    .catch((err) => {
      result(err, { "status": false });
    });


};


const getUsers = (userdata) => {

  return new Promise((resolve, reject) => {

    // console.log(userdata);
    let username = userdata.mob;

    // let password = userdata.user_password;

    const query = "SELECT * FROM userdetails WHERE mobno = ?";
    // console.log(query);
 
    sql.query(query,username, async (error, results) => {

      if (error) {
        reject(error);
        return;
      }
      else{

        if(results.length > 0){
          resolve(results);
        }
        else{
          reject(error);
          return;
        }
      }

    });
  });

}

module.exports = UserDetails;

