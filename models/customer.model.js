

const sql = require("./db.js");
const jwt = require('jsonwebtoken');


const Customer = function(customer) {
  this.id = customer.id;
  this.customername = customer.customername;
  this.mobno = customer.mobno;
  this.address = customer.address;
  this.created_by=customer.created_by;
};

Customer.create = (newCustomer, result) => {
  sql.query("INSERT INTO addcustomer SET ?", newCustomer, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    //const token = jwt.sign({ id: res.insertId },process.env.JWT_SECRETE_KEY, { expiresIn: process.env.JWT_EXPIRES_IN }) ; 
    console.log("created customer: ", { id: res.insertId, ...newCustomer });
    result(null, { id: res.insertId, ...newCustomer });
  });
};

Customer.getAll = (createdBy,result) => {
  sql.query("SELECT * FROM addcustomer WHERE created_by = ?", [createdBy], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("customers: ", res);
    result(null, res);
  });
};

Customer.findById = (customerId, result) => {
  sql.query("SELECT * FROM addcustomer WHERE id = ?", customerId, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found customer: ", res[0]);
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Customer.updateById = (id, customer, result) => {a
  sql.query(
    "UPDATE addcustomer SET customername = ?, mobno = ?, address = ? WHERE id = ?",
    [customer.customername, customer.mobno, customer.address, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("updated customer: ", { id: id, ...customer });
      result(null, { id: id, ...customer });
    }
  );
};

Customer.remove = (id, result) => {
  sql.query("DELETE FROM addcustomer WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.affectedRows == 0) {
      // Customer with the specified id not found
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("deleted customer with id: ", id);
    result(null, res);
  });
};

module.exports = Customer;
