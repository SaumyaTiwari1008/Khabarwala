const sql = require("./db.js");

const ProductDetails=function(productmaster){
    this.id=productmaster.id;
    this.product_name=productmaster.product_name;
    this.product_price=productmaster.product_price;
    this.status=productmaster.status;
    this.created_on=productmaster.created_on;
    this.created_by=productmaster.created_by;
}

ProductDetails.create = (newProduct, result) => {
    sql.query("INSERT INTO productmaster SET ?", newProduct, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("Added product: ", { id: res.insertId, ...newProduct });
      result(null, { id: res.insertId, ...newProduct });
    });
  };
  ProductDetails.getAll = result => {
    sql.query("SELECT * FROM productmaster", (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("products: ", res);
      result(null, res);
    });
  };
 //---------------------------------------------------------------//
  
  ProductDetails.findByName= async (ser_data, result) => {
  
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
  ProductDetails.getCurrent=result=>{
    sql.query("SELECT * FROM mappingtable WHERE hawker_id = ? and customer_id=?" ,(err,res)=>{
      if(err){
        console.log("error: ",err);
        result(err,null);
        return;
      }
      console.log("previous product: ",res);
      result(null,res);
    });
  };

  ProductDetails.insert_in_mapping = (newcustomer, result) => {
  
    console.log(newcustomer[0][4]);
    console.log(newcustomer[0][0]);
    var customer_id = newcustomer[0][0];
    var hawker_id = newcustomer[0][4];
  
    let query = "UPDATE `mappingtable` SET  `status` = 'inactive' WHERE `customer_id` = " + customer_id + " and `hawker_id` = " + hawker_id + " ;";
    
      sql.query(query, [newcustomer], (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        console.log('customer product marked as inactive ');
      });
  
    sql.query("INSERT INTO mappingtable (customer_id, product_id ,product_qty,product_startdate,hawker_id) values ?", [newcustomer], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
  
      result(null, { id: res.insertId, ...newcustomer[0] });
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

  ProductDetails.updateByHawkerIdandCustomerId = (formdata, result) => {
    return_data = {}
    // console.log(formdata);
  
    let query = "SELECT id, product_name, product_price,0 as product_qty FROM productmaster WHERE status='active';";
  
    sql.query(query, (err, res) => {
      if (err) {
        // console.log("error: ", err);
        result(null, err);
        return;
      }     
  
      // console.log("tutorials: ", res);
      if(res){
        return_data.table1 = res;
  
        let query1 = "SELECT mappingtable.product_id as id,productmaster.product_name,productmaster.product_price,mappingtable.product_qty FROM userdetails.mappingtable INNER JOIN productmaster ON productmaster.id=mappingtable.product_id WHERE mappingtable.status='active'and productmaster.status='active' and customer_id= " + formdata.customer_id + " and hawker_id= " + formdata.hawker_id + ";";
          // console.log(query1);
        sql.query(query1, (err, res1) => {
          if (err) {
            // console.log("error: ", err);
            result(null, err);
            return;
          }
      
          // console.log("tutorials: ", res);
          if(res1){    
            return_data.table2 = res1;
            // var array3 = merge(return_data.table1, return_data.table2);
  
            // console.log(return_data.table1);
            // console.log(return_data.table2);
            // console.log(array3);
      
            // const productMap = {};
  
            // return_data.table1.forEach(item => {
            //       productMap[item.product_id] = item;
            //   });
  
            //   return_data.table2.forEach(item => {
            //       if (productMap[item.product_id]) {
            //           productMap[item.product_id].qty += item.qty;
            //       } else {
            //           productMap[item.product_id] = item;
            //       }
            //   });
            
              // Convert the dictionary values back to an array
              // const mergedArray = Object.values(productMap);
  
              // console.log(mergedArray);
              const mergedMap = {};
  
              return_data.table1.forEach(item => {
                mergedMap[item.id] = {
                  ...item
                };
              });

  
              return_data.table2.forEach(item => {
                if (mergedMap[item.id]) {
                  // console.log(mergedMap[item.id].product_qty);
                  // console.log(item.product_qty);
                  mergedMap[item.id].product_qty += item.product_qty;
                  // if (item.cdate > mergedMap[item.product_id].cdate) {
                  //   mergedMap[item.product_id].cdate = item.cdate;
                  // }
                  // if (item.cdate) {
                  //   mergedMap[item.product_id].cdate = item.cdate;
                  // }
                } else {
                  mergedMap[item.id] = {
                    ...item
                  };
                }
              });
  
              const mergedArray = Object.values(mergedMap);
  
              console.log(mergedArray);
  
  
          result(null, mergedArray);
          }
        });
  
        // result(null, res);
      }
    });
  };
  

// Function to get current data for calculation
ProductDetails.getCurrentdataforcalc = (formdata, result) => {
  const return_data = {};

  let query = "SELECT id, product_name, product_price, 0 as product_qty FROM productmaster WHERE status='active';";

  sql.query(query, (err, res) => {
    if (err) {
      console.error("Error: ", err);
      result(err, null);
      return;
    }

    if (res) {
      return_data.table1 = res;

      let query1 = `
        SELECT 
          mt.product_id as id,
          pm.product_price,
          mt.product_qty,
          (mt.product_qty * pm.product_price) AS total_amt
        FROM 
          userdetails.mappingtable mt
        INNER JOIN 
          productmaster pm ON pm.id = mt.product_id
        WHERE 
          mt.status='active' 
          AND pm.status='active' 
          AND mt.customer_id = ? 
          AND mt.hawker_id = ?;
      `;

      sql.query(query1, [formdata.customer_id, formdata.hawker_id], (err, res1) => {
        if (err) {
          console.error("Error: ", err);
          result(err, null);
          return;
        }

        if (res1) {
          return_data.table2 = res1;

          const mergedMap = {};

          return_data.table1.forEach(item => {
            mergedMap[item.id] = { ...item };
          });

          return_data.table2.forEach(item => {
            if (mergedMap[item.id]) {
              mergedMap[item.id].product_qty += item.product_qty;
            } else {
              mergedMap[item.id] = { ...item };
            }
          });

          const mergedArray = Object.values(mergedMap);
          console.log(mergedArray);

          const total_amount = res1.reduce((acc, item) => acc + item.total_amt, 0);

          // result(null, { products: mergedArray, total_amount: total_amount });
          if (typeof result === 'function') result(null, { products: mergedArray, total_amount: total_amount });

        }
      });
    }
  });
};




ProductDetails.getProductDataofUser = (formData, result) => {
  const { customer_id, hawker_id, start_date, end_date } = formData;

  const query = `
      SELECT
          mappingtable.product_id AS id,
          productmaster.product_name,
          productmaster.product_price,
          mappingtable.product_qty,
          (productmaster.product_price * mappingtable.product_qty) AS total_amt
      FROM
          mappingtable
      INNER JOIN
          productmaster ON productmaster.id = mappingtable.product_id
      WHERE
          mappingtable.status = 'active'
          AND productmaster.status = 'active'
          AND customer_id = ?
          AND hawker_id = ?
          AND MONTH(mappingtable.product_startdate) >= MONTH(?)
          AND YEAR(mappingtable.product_startdate) >= YEAR(?);`;

  sql.query(query, [customer_id, hawker_id, start_date, start_date], (err, rows) => {
      if (err) {
          console.error('Error executing query:', err);
          result(err, null);
          return;
      }

      const productList = rows.map(row => ({
          id: row.id,
          product_name: row.product_name,
          product_price: row.product_price,
          product_qty: row.product_qty,
          total_amt: row.total_amt
      }));

      result(null, productList);
  });
};

  module.exports = ProductDetails;
  
  

