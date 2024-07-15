const sql = require("./db.js");


module.exports.searchCustomerProductDetailsForBill = (Serchdata, result) => {

  const query = `CALL Generate_product_for_billing_new(?, ?, ?, ?,?)`;
  const params = [Serchdata.startdate, Serchdata.enddate, Serchdata.customer_id, Serchdata.hawker_id];


  sql.query(query,params, (err, res) => {
    if (err) {
     
      result(null, err);
      return;
    }

    
    result(null, res[0]);
  });
};


// get billhistory by customer_id and hawker_id

 module.exports.getBalanceHistory = (where,result)=>{

      let qry = "select date_format(transaction_master.created_date,'%Y-%m-%d') as trans_date,CAST(collection_amount AS CHAR(7)) as collection_amount,CAST(IFNULL(collection_master.discount,0) AS CHAR(7)) as discount, '0' as final_amount,trans_type, transaction_master.bill_id, collection_id,transaction_master.collection_status  from transaction_master left join collection_master on transaction_master.collection_id = collection_master.id where transaction_master.customer_id="+where.customer_id+" and transaction_master.created_by="+where.hawker_id+" and trans_status = 1 order by transaction_master.id desc";
      console.log(qry);
      sql.query(qry,(err,res)=>{

        if(err)
        {
          result(err, null);
          return;
        }
        else
        {
          result(null, res);
        }

      });
  };


  module.exports.customerDetailsById = (where, result) => {

    sql.query("select customername,address,mobno from addcustomer where id=" + where.customer_id , (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
    
      result(null, res);
    });
  };



  module.exports.insert_newbillingeneratebill = (insert_newaddon_dtls, result) => {
    sql.query("INSERT INTO generate_bill_mst SET ?", insert_newaddon_dtls, (err, res) => {
      if (err) {
        console.log("error: ", err);
       
        result('Something went wrong while adding new bill error code : '+err.code+' error no :' +err.errno+'. Contact Administrator', null);

        return;
      }
      result(null, { id: res.insertId });
      return;
    });
  };

    
    module.exports.InsertAddonDetailsBeforBill = (Serchdata, result) => {
      console.log(Serchdata);
      let return_data = {};

      function runQuery(query, params) {
          return new Promise((resolve, reject) => {
              sql.query(query, params, (err, res) => {
                  if (err) {
                      reject(err);
                  } else {
                      console.log(res); // Add this line for debugging
  
                      // Assuming insertId is in res.insertId, but please check the structure
                      resolve(res);
                  }
              });
          });
      }
  
      let insert_newaddon_dtls = {
          item_name: Serchdata.item_name,
          type: 0,
          status: 1,
          created_date: Serchdata.created_date,
          created_by: Serchdata.created_by    
      };
  
      runQuery("INSERT INTO addon_master SET ?", insert_newaddon_dtls)
          .then(resultArray => {
              console.log(resultArray);
  
              if (resultArray && resultArray.insertId) {
                  let insert_customer_product_addon_dtls = {
                      customer_id: Serchdata.customer_id,       
                      addon_price: Serchdata.addon_price,
                      addon_start_dt: Serchdata.created_date,
                      addon_end_dt: Serchdata.created_date,
                      status: 1,
                      created_date: Serchdata.created_date,
                      created_by: Serchdata.created_by,
                      addon_id: resultArray.insertId
                  };
                  return_data.addonid =  resultArray.insertId;
                  return_data.addonamt =  Serchdata.addon_price;
                  return runQuery("INSERT INTO customer_product_addon SET ?", insert_customer_product_addon_dtls);
              } else {
                  throw new Error('Insert failed or did not return an insert ID.');
              }
          })
          .then(resultArray1 => {
              result(null, return_data);
          })
          .catch(err => {
              result(err);
          });
  };
  
 //------------------------------------------------------------------ 
 module.exports.getBillPDF_details = (Serchdata, result) => {
console.log(Serchdata);
  sql.query("select id,bill_no,date_format(created_date,'%Y-%m-%d')  as bill_created_date, date_format(bill_start_dt,'%Y-%m-%d')  as startdate,  date_format(bill_end_dt,'%Y-%m-%d')  as enddate  from generate_bill_mst where customer_id=" + Serchdata.customer_id + " and created_by=" + Serchdata.hawker_id + " and id=" + Serchdata.bill_id + " and bill_status=1 order by id desc limit 1", (err, newres) => {

    if (err) {
      result(null, err);
      return;
    }

    console.log(newres);

    const query = `CALL Generate_product_for_pdf(?, ?, ?, ?,?)`;
    const params = [newres[0].startdate, newres[0].enddate, Serchdata.customer_id, Serchdata.hawker_id,newres[0].id];

    console.log(params);

    sql.query(query, params, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      //onst sqlqry = `SELECT c1.id AS customer_id, c1.customername AS customer_name,c1.mobno AS mobile,c1.address AS customer_address,c2.mobno AS hawker_contact_number,c2.city_id,c2.fullname AS hawker_name,s.state_name,ci.city_name FROM addcustomer c1 LEFT JOIN userdetails c2 ON c1.id = c2.userid LEFT JOIN states s ON c2.state_id = s.state_id LEFT JOIN cities ci ON c2.city_id = ci.city_id WHERE c1.id = ${Serchdata.customer_id}`;
      const sqlqry = `
      SELECT 
          c1.id AS customer_id,
          c1.customername AS customer_name,
          c1.address AS billing_area,
          c1.mobno AS mobile,
          c2.mobno AS hawker_contact_number,
          c2.city_id AS hawker_address,
          c2.fullname AS hawker_name,
          s.state_name,
          ci.city_name
      FROM 
          addcustomer c1
      LEFT JOIN 
          mappingtable mt ON c1.id = mt.customer_id
      LEFT JOIN 
          userdetails c2 ON mt.hawker_id = c2.userid
      LEFT JOIN 
          states s ON c2.state_id = s.state_id
      LEFT JOIN 
          cities ci ON c2.city_id = ci.city_id
      WHERE 
          c1.id = ${Serchdata.customer_id}`;
      
          console.log(sqlqry);
      sql.query(sqlqry, (err, res1) => {


      
      
        console.log(res1);
        const query1 = "CALL Generate_addon_for_pdf(?,?,?)";
        const params1 = [Serchdata.customer_id, Serchdata.hawker_id, newres[0].id];

          sql.query(query1,params1, (err, res2) => {

            const responseObj = {
              product_details: res[0],
              customer_data: res1,
              new_dates_start: newres[0].startdate,
              new_dates_end: newres[0].enddate,
             // prev_balance: newres[0].prev_balance,
              bill_created_date:newres[0].bill_created_date,
              bill_no: newres[0].bill_no,
            };
            console.log(res[0])
            
            result(null, responseObj);

          });

      });


    });

  })

};
// to check if bill is already generated

module.exports.CheckPreviousBills = (where, result) => {

  let query = "SELECT gb.id FROM generate_bill_mst gb  where gb.customer_id = " + where.customer_id + " and gb.bill_start_dt = date_format('" + where.startdate + "','%Y-%m-%d') and gb.bill_end_dt = date_format('" + where.enddate + "','%Y-%m-%d') and gb.bill_status =1 and gb.created_by = " + where.hawker_id
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result('Something went wrong while generating bill error code : '+err.code+' error no :' +err.errno+'. Contact Administrator', null);
      return;
    }

    if(res.length > 0)
    {
      console.log("error: ", 'Bill already generated for this duration');

      result('Bill already generated for this duration', null);
      return;
    }
    else{
      result(null, res);
    }
  });
};



// module.exports.LastBill = (Serchdata, result) => {

//   sql.query("select id,bill_no,date_format(created_date,'%Y-%m-%d')  as bill_created_date, date_format(bill_start_dt,'%Y-%m-%d')  as startdate,  date_format(bill_end_dt,'%Y-%m-%d')  as enddate  from generate_bill_mst where customer_id=" + Serchdata.customer_id + " and created_by=" + Serchdata.hawker_id + " and bill_status=1 order by id desc limit 1", (err, newres) => {

//     if (err) {
//       result(null, err);
//       return;
//     }

//     console.log(newres);

//     const query = `CALL Generate_product_for_pdf(?, ?, ?, ?,?)`;
//     const params = [newres[0].startdate, newres[0].enddate, Serchdata.customer_id, Serchdata.hawker_id,newres[0].id];

//     console.log(params);

//     sql.query(query, params, (err, res) => {
//       if (err) {
//         result(null, err);
//         return;
//       }

//       //onst sqlqry = `SELECT c1.id AS customer_id, c1.customername AS customer_name,c1.mobno AS mobile,c1.address AS customer_address,c2.mobno AS hawker_contact_number,c2.city_id,c2.fullname AS hawker_name,s.state_name,ci.city_name FROM addcustomer c1 LEFT JOIN userdetails c2 ON c1.id = c2.userid LEFT JOIN states s ON c2.state_id = s.state_id LEFT JOIN cities ci ON c2.city_id = ci.city_id WHERE c1.id = ${Serchdata.customer_id}`;
//       const sqlqry = `
//       SELECT 
//           c1.id AS customer_id,
//           c1.customername AS customer_name,
//           c1.address AS billing_area,
//           c1.mobno AS mobile,
//           c2.mobno AS hawker_contact_number,
//           c2.city_id AS hawker_address,
//           c2.fullname AS hawker_name,
//           s.state_name,
//           ci.city_name
//       FROM 
//           addcustomer c1
//       LEFT JOIN 
//           mappingtable mt ON c1.id = mt.customer_id
//       LEFT JOIN 
//           userdetails c2 ON mt.hawker_id = c2.userid
//       LEFT JOIN 
//           states s ON c2.state_id = s.state_id
//       LEFT JOIN 
//           cities ci ON c2.city_id = ci.city_id
//       WHERE 
//           c1.id = ${Serchdata.customer_id}`;
      
//           console.log(sqlqry);
//       sql.query(sqlqry, (err, res1) => {


      
      
//         console.log(res1);
//         const query1 = "CALL Generate_addon_for_pdf(?,?,?)";
//         const params1 = [Serchdata.customer_id, Serchdata.hawker_id, newres[0].id];

//           sql.query(query1,params1, (err, res2) => {

//             const responseObj = {
//               product_details: res[0],
//               customer_data: res1,
//               new_dates_start: newres[0].startdate,
//               new_dates_end: newres[0].enddate,
//              // prev_balance: newres[0].prev_balance,
//               bill_created_date:newres[0].bill_created_date,
//               bill_no: newres[0].bill_no,
//             };
//             console.log(res[0])
            
//             result(null, responseObj);

//           });

//       });


//     });

//   })

// };
module.exports.LastBill = (Serchdata, result) => {

  sql.query("select id,bill_no,date_format(created_date,'%Y-%m-%d')  as bill_created_date, date_format(bill_start_dt,'%Y-%m-%d')  as startdate,  date_format(bill_end_dt,'%Y-%m-%d')  as enddate  from generate_bill_mst where customer_id=" + Serchdata.customer_id + " and created_by=" + Serchdata.hawker_id + " and bill_status=1 order by id desc limit 1", (err, newres) => {

    if (err) {
      result(null, err);
      return;
    }

    console.log(newres);

    const query = `CALL Generate_product_for_pdf(?, ?, ?, ?,?)`;
    const params = [newres[0].startdate, newres[0].enddate, Serchdata.customer_id, Serchdata.hawker_id,newres[0].id];

    console.log(params);

    sql.query(query, params, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      const sqlqry = 
      `SELECT 
          c1.id AS customer_id,
          c1.customername AS customer_name,
          c1.address AS billing_area,
          c1.mobno AS mobile,
          c2.mobno AS hawker_contact_number,
          c2.city_id AS hawker_address,
          c2.fullname AS hawker_name,
          s.state_name,
          ci.city_name
      FROM 
          addcustomer c1
      LEFT JOIN 
          mappingtable mt ON c1.id = mt.customer_id
      LEFT JOIN 
          userdetails c2 ON mt.hawker_id = c2.userid
      LEFT JOIN 
          states s ON c2.state_id = s.state_id
      LEFT JOIN 
          cities ci ON c2.city_id = ci.city_id
      WHERE 
          c1.id = ${Serchdata.customer_id}`;
      
          console.log(sqlqry);
      sql.query(sqlqry, (err, res1) => {


      
      
        console.log(res1);
        const query1 = "CALL Generate_addon_for_pdf(?,?,?)";
        const params1 = [Serchdata.customer_id, Serchdata.hawker_id, newres[0].id];

          sql.query(query1,params1, (err, res2) => {

            const responseObj = {
              product_details: res[0],
              customer_data: res1,
              new_dates_start: newres[0].startdate,
              new_dates_end: newres[0].enddate,
             // prev_balance: newres[0].prev_balance,
              bill_created_date:newres[0].bill_created_date,
              bill_no: newres[0].bill_no,
            };
            console.log(res[0])
            
            result(null, responseObj);

          });

      });


    });

  })

}; 

module.exports.getBillDetails = (bill_id) => {
  return new Promise((resolve, reject) => {
    let qry = `SELECT * FROM generate_bill_mst WHERE id = ?`;
    sql.query(qry, [bill_id], (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res[0]);
    });
  });
};

module.exports.getCollectionByBillId = (bill_id) => {
  return new Promise((resolve, reject) => {
    let qry = `SELECT * FROM collection_master WHERE bill_id = ?`;
    sql.query(qry, [bill_id], (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res[0]); // Assuming there should only be one collection per bill_id
    });
  });
};

module.exports.insertIntoCollectionMaster = (data) => {
  return new Promise((resolve, reject) => {
    let qry = `INSERT INTO collection_master SET ?`;
    sql.query(qry, data, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res.insertId);
    });
  });
};

module.exports.insertIntoTransactionMaster = (data) => {
  return new Promise((resolve, reject) => {
    let qry = `INSERT INTO transaction_master SET ?`;
    sql.query(qry, data, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res.insertId);
    });
  });
};

module.exports.updateBillStatus = (bill_id, status) => {
  return new Promise((resolve, reject) => {
    let qry = `UPDATE generate_bill_mst SET bill_status = ? WHERE id = ?`;
    sql.query(qry, [status, bill_id], (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};

module.exports.updateTransactionCollectionStatus = (bill_id) => {
  return new Promise((resolve, reject) => {
    let qry = `UPDATE transaction_master SET collection_status = 1 WHERE collection_id=0 and trans_type='DR' and bill_id = ?`;
   //console.log(qry);
    sql.query(qry, [bill_id], (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};

module.exports.getCollectionDetails = (collection_id) => {
  return new Promise((resolve, reject) => {
    let qry = `SELECT * FROM collection_master WHERE id = ?`;
    sql.query(qry, [collection_id], (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res[0]);
    });
  });
};
