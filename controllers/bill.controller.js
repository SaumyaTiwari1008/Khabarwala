const BillM = require("../models/bill.model.js");
const ptransM = require("../models/transaction.model.js");
const puppeteer = require('puppeteer');
const { Console } = require("console");
const { exit } = require("process");
const fs = require('fs').promises
require('dotenv').config();
const productM=require("../models/product.model.js");
const { stat } = require("fs");

//3.
const generateBillTransactionId = () => {
  let randomString = '1'; 
  const possibleDigits = '0123456789';

  for (let i = 1; i < 2; i++) {
    const randomDigit = possibleDigits[Math.floor(Math.random() * possibleDigits.length)];
    randomString += randomDigit;
  }
  console.log(randomString);

  return 'B' + new Date().getTime() + randomString;
}
//4.
const generateTransactionId = () => {
  let randomString = '1'; 
  const possibleDigits = '0123456789';

  for (let i = 1; i < 2; i++) {
    const randomDigit = possibleDigits[Math.floor(Math.random() * possibleDigits.length)];
    randomString += randomDigit;
  }
  console.log(randomString);

  return 'T' + new Date().getTime() + randomString;
}

//5.
exports.getCustomerProductDetailsForBill = async function (req, res) { //search the required data for billing in the mapping table
  const Serchdata = {
    customer_id: req.body.customer_id,
    hawker_id: req.body.hawker_id,
    startdate: req.body.start_date,
    enddate: req.body.end_date,

  };
  

  BillM.searchCustomerProductDetailsForBill(Serchdata, (err, data) => {
    if (err)
      res.status(500).send({
        status: false,
        msg: "Some error occurred while retrieving all products for billing.",
        data: {}
      });
    else res.send({
      status: true,
      msg: "Request successful .!!",
      data
    });
  });

};

//4.
let CustomerProductDetailsForBill = (user_data) => new Promise(function (resolve, reject) {
  setTimeout(() => {
    BillM.searchCustomerProductDetailsForBill(user_data, async (err, res) => {
      if (res) {
        // console.log(res);
        resolve(res);
      }
      else {
        reject(err);
      }
    });
  }, 1000);
});
//yes
let customerDetailsById = (user_data) => new Promise(function (resolve, reject) {
  setTimeout(() => {
    BillM.customerDetailsById(user_data, async (err, res) => {
      if (res) {
        resolve(res);
      }
      else {
        reject(err);
      }
    });
  }, 1000);
});
//yes
let addnewbill = (insert_newaddon_dtls) => new Promise(function (resolve, reject) {

  setTimeout(() => {
    BillM.insert_newbillingeneratebill(insert_newaddon_dtls, async (err, res) => {
      if (res) {
        resolve(res.id);
      }
      else {
        reject(err);
      }
    });
  }, 1000);
});
//yes


let insert_transaction_entry = (insert_transaction_dtls) => new Promise(function (resolve, reject) {

  setTimeout(() => {
    ptransM.insert_transaction_data(insert_transaction_dtls, async (err, res) => {
      if (res) {
        resolve(res.id);
      }
      else {
        reject(err);
      }
    });
  }, 1000);
});

//2.
let generatebill = async (user_data) => {
  const bill_transactionId = generateBillTransactionId();
  const transactionId = generateTransactionId();

  try {
    const Serchdata = {
      customer_id: user_data.customer_id,
      hawker_id: user_data.hawker_id,
      startdate: user_data.startdate,
      enddate: user_data.enddate
    };  // for the mapping table

    const checkOldBill = await CheckPreviousBills(Serchdata);
    console.log(checkOldBill.length);
  
    if (checkOldBill.length > 0) {
      return checkOldBill.status(400).json({ errors: "Bill already generated for this selected duration" });
    }
    const custdata = {
      customer_id: user_data.customer_id,
      //hawker_id: user_data.hawker_id
    };

    var moment = require('moment');
    let ts_hms = new Date();
    let entry_date = moment(ts_hms, 'DD-MM-YYYY').format('YYYY-MM-DD');


  
    const first_data = await CustomerProductDetailsForBill(Serchdata);
    
    const second_data = await customerDetailsById(custdata);
    

    let created_month = moment(entry_date, 'YYYY-MM-DD').format('MM');
    let created_year = moment(entry_date, 'YYYY-MM-DD').format('YYYY');

    const decimal1 = parseFloat(user_data.total_amt); 
     

    const sum = decimal1 ;

    const generatebill_tbl_insert = {
      bill_no: bill_transactionId,
      customer_id: user_data.customer_id,
      bill_amount: sum,
      bill_start_dt: user_data.startdate,
      bill_end_dt: user_data.enddate,
      bill_month: created_month,
      bill_year: created_year,
      bill_status: 1,
      created_date: entry_date,
      created_by: user_data.hawker_id,
      
    };



    const third_data = await addnewbill(generatebill_tbl_insert);

    let product = first_data;
    var final_data = [];

    for (let index = 0; index < product.length; index++) {
      final_data.push([
        third_data,
        user_data.customer_id,
        product[index]['product_id'],
        0,
        (product[index]['product_price'] * product[index]['product_quantity']),
        user_data.enddate,
        1,
        entry_date,
        user_data.hawker_id
      ]);
    }

    //const forth_data = await addnewbill_product_addon(final_data);


    const billdate = new Date(entry_date); 
    const year = billdate.getFullYear();
    const month = billdate.getMonth() + 1;

    const insert_transaction_data = {
      transaction_id: transactionId,
      customer_id: user_data.customer_id,
      created_by: user_data.hawker_id,
      bill_id: third_data,
      collection_id: 0,
      collection_amount: sum,
      billed_date: entry_date,
      billed_month: month,
      billed_year: year,
      trans_type: 'DR',
      trans_status: 1,
      collection_status:0
    };

    


    const fifth_data = await insert_transaction_entry(insert_transaction_data);
    return fifth_data;
  } catch (error) {
    console.log(error);
    throw error;

  }

}

//1.
// exports.generatenewBill = (req, res) => {
//   const user_data = {
//     customer_id: req.body.customer_id,
//     hawker_id: req.body.hawker_id,
//     startdate: req.body.start_date,
//     enddate: req.body.end_date,
//     total_amt: req.body.total_amount,
//     final_amt: req.body.final_total_amount,
//   };

//   productM.getCurrentdataforcalc(user_data.hawker_id, user_data.customer_id, (err, result) => {
//     if (err) {
//       console.error('Error fetching product details:', err);
//       res.status(200).json({ status: false, msg: "Error fetching product details", data: null });
//       return;
//     }
//     const total_amt = result.total_amount;

//     user_data.total_amt = total_amt;
//     user_data.final_amt = total_amt;
//   console.log(req.body);

//   generatebill(user_data)
//     .then((result) => {
//       const response = {
//         status: true,
//         msg: "Bill Generated Successfully",
//         data: result,
//       };
//       res.status(200).json(response);
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//       res.status(200).json({ status: false, msg: error, data: null });
//     });
// });
// }



exports.generatenewBill = (req, res) => {
  const user_data = {
    customer_id: req.body.customer_id,
    hawker_id: req.body.hawker_id,
    startdate: req.body.start_date,
    enddate: req.body.end_date,
    total_amt: req.body.total_amount, 
    final_amt: req.body.final_total_amount, 
  };

  productM.getCurrentdataforcalc({ hawker_id: user_data.hawker_id, customer_id: user_data.customer_id }, (err, result) => {
    if (err) {
      console.error('Error fetching product details:', err);
      return res.status(500).json({ status: false, msg: "Error fetching product details", data: null });
    }

    const total_amt = result.total_amount;
    user_data.total_amt = total_amt;
    user_data.final_amt = total_amt;

    console.log(req.body);

    generatebill(user_data)
      .then((result) => {
        const response = {
          status: true,
          msg: "Bill Generated Successfully",
          data: result,
        };
        return res.status(200).json(response);
      })
      .catch((error) => {
        console.error('Error:', error);
        return res.status(500).json({ status: false, msg: "Error generating bill", data: null });
      });
  });
};



let InsertAddonDetailsBeforBill = (user_data) => new Promise(function (resolve, reject) {
  setTimeout(() => {
    BillM.InsertAddonDetailsBeforBill(user_data, async (err, res) => {
      if (res) {
        resolve(res);
      }
      else {
        reject(err);
      }
    });
  }, 1000);
});

//-----------------------------------------
exports.generateBillPDF = (req, res) => {
  console.log('test');

  const Serchdata = {
      bill_id: req.body.bill_id,
      customer_id: req.body.customer_id,
      hawker_id: req.body.hawker_id,
      
  };
  console.log(Serchdata);
  var moment = require('moment');
  let t = new Date();
  let x = moment(t.date).format('DD-MM-YYYY HH:mm:ss');

  let return_data = {};
  let page; // Define page variable

  const customWidth = (210 / 2);  // Width in pixels
  const customHeight = 148; // Height in pixels

  browserPromise.then(browser => {
      return browser.newPage();
  })
  .then(newPage => {
      page = newPage; // Assign newPage to the page variable

      // Set viewport size before setting content
      return page.setViewport({ width: customWidth, height: customHeight, deviceScaleFactor: 1.5  })
          .then(() => fs.readFile(path.join(__dirname, '../views/', "generatebill.ejs"), 'utf-8'));
  })
  .then(template => {
      const compiledTemplate = ejs.compile(template);

      return new Promise((resolve, reject) => {
          BillM.getBillPDF_details(Serchdata, (err, data) => {
              if (err) {
                  // page.close(); // Close the page on error
                  reject(err);
                  return;
              }

              data['curr_date'] = x;

              const totalDays = countDaysBetweenDates(new Date(data.new_dates_start), new Date(data.new_dates_end));

              const extradata = [{
                  totalDays: totalDays,
                  startDate:  moment(data.new_dates_start, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  endDate:   moment(data.new_dates_end, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  bill_created_date:   moment(data.bill_created_date, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  bill_no: data.bill_no,
                  // prev_balance: data.prev_balance,
              }];

              return_data['product_data'] = data;
              return_data['extra_data'] = extradata;

              const htmlContent = compiledTemplate({ response: data, response1: extradata });

              // <%= data.product_data[0].curr_date: %>
              page.setContent(htmlContent).then(() => {
                  resolve({ page, pdfname: 'newbill' + new Date().getTime() + '.pdf' });
              });
          });
      });
  })
  .then(({ page, pdfname }) => {
    return page.pdf({ path: 'uploads/bills/' + pdfname,
    width: (210 / 2) * 2.835,
  height: 148 * 2.835,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
    printBackground: true })
        .then(() => {
            let pdfurl = process.env.BASE_URL+'/uploads/bills/' + pdfname;
            return { pdfurl, page };
        });
})
  .then(({ pdfurl, page }) => {
      if (pdfurl) {
          return_data['pdf_data'] = { "pdf_name": pdfurl };
          console.log('check return data');
          console.log(return_data);
          res.status(200).json({ status: true, msg: 'PDF generate successfully', data: return_data });
      } else {
          // page.close(); // Close the page if no pdfurl
          res.status(200).json({ status: false, msg: 'PDF not found', data: pdfurl });
      }
  })
  .catch(error => {
      console.error(error);
      res.status(500).send('Error generating PDF');
  });
};


exports.getProductDataForBill = (req, res) => {
    const { customer_id, hawker_id, start_date, end_date } = req.body;

    if (!customer_id || !hawker_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    productM.getProductDataofUser({ customer_id, hawker_id, start_date, end_date }, (err, productList) => {
        if (err) {
            console.error('Error retrieving product data:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json({
            status:true,
            message: 'Product data retrieved successfully',
            data: productList
        });
    });
};
let CheckPreviousBills = (user_data) => new Promise(function (resolve, reject) {
  setTimeout(() => {
    BillM.CheckPreviousBills(user_data, async (err, res) => {
      if (res) {
        resolve(res);
      }
      else {
        reject(err);
      }
    });
  }, 1000);
})

//to get previous transactions  of customer and hawker

exports.getBalanceHistory = async function (req, res) {

  const where = {
    customer_id: req.body.customer_id,
    hawker_id: req.body.hawker_id
  }

  BillM.getBalanceHistory(where, (err, data) => {
    console.log(data);

    if (err)
      res.status(500).send({
        status: false,
        msg: "Some error occurred while retrieving all history of customer.", 
        data: {}
      });
    else res.send({
      status: true,
      msg: "Request successful .!!",
      data
    });
  })

};

// exports.getBalanceHistory = async function (req, res) {
//   const { customer_id, hawker_id } = req.body;

//   try {
//     const where = {
//       customer_id,
//       hawker_id
//     };

//     const balanceHistory = await BillM.getBalanceHistory(where);
//     res.send({
//       status: true,
//       msg: "Request successful.",
//       data: balanceHistory
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({
//       status: false,
//       msg: "Some error occurred while retrieving balance history.",
//       data: {}
//     });
//   }
// };














//================================================
// to collect payment of the customer

const generateReceiptNo = () => {
  let randomString = '1'; 
  const possibleDigits = '0123456789';

  for (let i = 1; i < 2; i++) {
    const randomDigit = possibleDigits[Math.floor(Math.random() * possibleDigits.length)];
    randomString += randomDigit;
  }
  console.log(randomString);

  return 'RC' + new Date().getTime() + randomString;
  
};


// exports.collectPayment = async function (req, res) {
//   const { customer_id, hawker_id, bill_id } = req.body;

//   try {
//     // Check if a collection record already exists for the bill_id
//     const existingCollection = await BillM.getCollectionByBillId(bill_id);
//     if (existingCollection) {
//       return res.status(400).send({
//         status: false,
//         msg: "Payment for this bill has already been collected.",
//         data: existingCollection
//       });
//     }

//     // Fetch bill details
//     const billDetails = await BillM.getBillDetails(bill_id);
//     if (!billDetails) {
//       return res.status(404).send({
//         status: false,
//         msg: "Bill not found.",
//         data: {}
//       });
//     }

//     const billed_date = billDetails.created_date;
//     const bill_month = billDetails.bill_month;
//     const collect_amount = billDetails.bill_amount;
//     const discount = 0;
//     const payment_mode = 1;
//     const remark = "Payment collected for bill";

//     const collectionData = {
//       customer_id,
//       hawker_id,
//       bill_id,
//       collect_amount,
//       discount,
//       payment_mode,
//       remark,
//       collection_date: new Date(),
//       collection_status: 1,
//       created_date: billed_date,
//       receipt_no: generateReceiptNo(),
//       sent_sms: 0
//     };

//     const collectionId = await BillM.insertIntoCollectionMaster(collectionData);

//     const transactionData = {
//       customer_id,
//       bill_id,
//       collection_id: collectionId,
//       collection_amount: collect_amount,
//       trans_type: 'CR',
//       trans_status: 1,
//       created_date: new Date(),
//       created_by: hawker_id,
//       transaction_id: generateTransactionId(),
//       billed_date: billed_date,
//       billed_month: bill_month
//     };

//     await BillM.insertIntoTransactionMaster(transactionData);

//     await BillM.updateBillStatus(bill_id, 0);

//     // Fetch collection details for response
//     const collectionDetails = await BillM.getCollectionDetails(collectionId);

//     res.send({
//       status: true,
//       msg: "Payment collected successfully.",
//       data: collectionDetails
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({
//       status: false,
//       msg: "Some error occurred while collecting payment.",
//       data: {}
//     });
//   }
// };


exports.collectPayment = async function (req, res) {
  const { customer_id, hawker_id, bill_id } = req.body;

  try {
    // Check if a collection record already exists for the bill_id
    const existingCollection = await BillM.getCollectionByBillId(bill_id);
    if (existingCollection) {
      return res.status(400).send({
        status: false,
        msg: "Payment for this bill has already been collected.",
        data: existingCollection
      });
    }

    // Fetch bill details
    const billDetails = await BillM.getBillDetails(bill_id);
    if (!billDetails) {
      return res.status(404).send({
        status: false,
        msg: "Bill not found.",
        data: {}
      });
    }

    const billed_date = billDetails.created_date;
    const bill_month = billDetails.bill_month;
    const collect_amount = billDetails.bill_amount;
    const discount = 0;
    const payment_mode = 1;
    const remark = "Payment collected for bill";

    // Insert into collection_master
    const collectionData = {
      customer_id,
      hawker_id,
      bill_id,
      collect_amount,
      discount,
      payment_mode,
      remark,
      collection_date: new Date(),
      collection_status: 1, // Set initial status as 1
      created_date: billed_date,
      receipt_no: generateReceiptNo(),
      sent_sms: 0
    };

    const collectionId = await BillM.insertIntoCollectionMaster(collectionData);

    // Insert into transaction_master
    const transactionData = {
      customer_id,
      bill_id,
      collection_id: collectionId,
      collection_amount: collect_amount,
      trans_type: 'CR',
      trans_status: 1,
      created_date: new Date(),
      created_by: hawker_id,
      transaction_id: generateTransactionId(),
      billed_date: billed_date,
      billed_month: bill_month,
      collection_status: 0
    };

    const transactionId = await BillM.insertIntoTransactionMaster(transactionData);

    await BillM.updateTransactionCollectionStatus(bill_id);

 
    const collectionDetails = await BillM.getCollectionDetails(collectionId);

    res.send({
      status: true,
      msg: "Payment collected successfully.",
      data: collectionDetails
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      msg: "Some error occurred while collecting payment.",
      data: {}
    });
  }
};
