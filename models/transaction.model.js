const sql = require("./db.js");

const Transaction = function(transaction) {
    
    this.id=transaction.id; 
    this.transaction_id=transaction.transaction_id; 
    this.customer_id=transaction.customer_id;
    this.bill_id=transaction.bill_id;
    this.collection_id=transaction.collection_id;
    this.collection_amount=transaction.collection_amount;
    this.customer_product_map_id=transaction.customer_product_map_id;
    this.addon_id=transaction.addon_id;
    this.billed_date=transaction.billed_date;
    this.billed_month=transaction.billed_month;
    this.billed_year=transaction.billed_year;
    this.trans_type=transaction.trans_type;
    this.trans_status=transaction.trans_status;
    this.created_date=transaction.created_date;
    this.created_by=transaction.created_by;
  };

  Transaction.create = (newTransaction, result) => {
    sql.query("INSERT INTO transaction_master SET ?", newTransaction, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("created transaction: ", { id: res.insertId, ...newTransaction });
      result(null, { id: res.insertId, ...newTransaction });
    });
  };

  
  // module.exports.insert_transaction_data = (insertTransactionDetails) => {
  //     return new Promise((resolve, reject) => {
  //         setTimeout(() => {
  //             const query = "INSERT INTO transaction_master SET ?";
  //             sql.query(query, insertTransactionDetails, (err, res) => {
  //                 if (err) {
  //                     console.error("Error inserting transaction data:", err);
  //                     reject(err);
  //                 } else {
  //                     resolve(res.insertId); 
  //                 }
  //             });
  //         }, 1000); 
  //     });
  // };

  Transaction.insert_transaction_data = (insert_transaction_dtls, result) => {
 
  sql.query("INSERT INTO transaction_master SET ?", insert_transaction_dtls,  (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...insert_transaction_dtls });
  });
};



  
  module.exports = Transaction;
  