const puppeteer = require('puppeteer');
const { Console } = require("console");
const { exit } = require("process");
const fs = require('fs').promises;
const ejs = require('ejs');
const path = require('path');
const BillM = require("../models/bill.model.js");
const moment = require('moment');


var browserPromise = puppeteer.launch({ headless: true,args: [ "--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"] });

exports.generateBillPDF = (req, res) => {
   
    const Serchdata = {
                bill_id: req.body.bill_id,
                customer_id: req.body.customer_id,
                hawker_id: req.body.hawker_id,
            };
    
    var moment = require('moment');
    let t = new Date();
    let x = moment(t.date).format('DD-MM-YYYY HH:mm:ss');
  
    let return_data = {};
    let page; 
  
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
            console.log(Serchdata);
            BillM.getBillPDF_details(Serchdata, (err, data) => {
                if (err) {
                    // page.close(); // Close the page on error
                    reject(err);
                    return;
                }
               // data = [];
                data['curr_date'] = x;
                data['meg'] = 'Hello new page';
  
                // console.log(data);
                const totalDays = countDaysBetweenDates(new Date(data.new_dates_start), new Date(data.new_dates_end));

              const extradata = [{
                  totalDays: totalDays,
                  startDate:  moment(data.new_dates_start, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  endDate:   moment(data.new_dates_end, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  bill_created_date:   moment(data.bill_created_date, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  bill_no: data.bill_no,
                 
              }];

              return_data['product_data'] = data;
              return_data['extra_data'] = extradata;
                const htmlContent = compiledTemplate({ response: data});
  
                // <%= data.product_data[0].curr_date: %>
                page.setContent(htmlContent).then(() => {
                    resolve({ page, pdfname: 'newbill' + new Date().getTime() + '.pdf' });
                });
            });
        });
    })
    .then(({ page, pdfname }) => {
      return page.pdf({ path: 'uploads/' + pdfname,
      width: (210 / 2) * 2.835,
    height: 148 * 2.835,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true })
          .then(() => {
              let pdfurl = 'http://10.51.140.130:3005/uploads/' + pdfname;
              return { pdfurl, page };
          });
  })
    .then(({ pdfurl, page }) => {
        if (pdfurl) {
            return_data['pdf_data'] = { "pdf_name": pdfurl };
            console.log('check return data');
            console.log(return_data);
            // page.close(); // Close the page after generating PDF
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

  exports.lastbillpdf = (req, res) => {
   console.log(req.body);

    const Serchdata = {
                
                customer_id: req.body.customer_id,
                hawker_id: req.body.hawker_id,
            };
    
    var moment = require('moment');
    let t = new Date();
    let x = moment(t.date).format('DD-MM-YYYY HH:mm:ss');
  
    let return_data = {};
    let page; 
  
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
            BillM.LastBill(Serchdata, (err, data) => {
                if (err) {
                    // page.close(); // Close the page on error
                    reject(err);
                    return;
                }
               // data = [];
                data['curr_date'] = x;
                data['meg'] = 'Hello new page';
  
                // console.log(data);
                const totalDays = countDaysBetweenDates(new Date(data.new_dates_start), new Date(data.new_dates_end));

              const extradata = [{
                  totalDays: totalDays,
                  startDate:  moment(data.new_dates_start, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  endDate:   moment(data.new_dates_end, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  bill_created_date:   moment(data.bill_created_date, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  bill_no: data.bill_no,
                 
              }];

              return_data['product_data'] = data;
              return_data['extra_data'] = extradata;
                const htmlContent = compiledTemplate({ response: data});
  
                // <%= data.product_data[0].curr_date: %>
                page.setContent(htmlContent).then(() => {
                    resolve({ page, pdfname: 'newbill' + new Date().getTime() + '.pdf' });
                });
            });
        });
    })
    .then(({ page, pdfname }) => {
      return page.pdf({ path: 'uploads/' + pdfname,
      width: (210 / 2) * 2.835,
    height: 148 * 2.835,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true })
          .then(() => {
              let pdfurl = 'http://10.51.140.130:3005/uploads/' + pdfname;
              return { pdfurl, page };
          });
  })
    .then(({ pdfurl, page }) => {
        if (pdfurl) {
            return_data['pdf_data'] = { "pdf_name": pdfurl };
            console.log('check return data');
            console.log(return_data);
            // page.close(); // Close the page after generating PDF
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
//   ==================================================================
//   exports.generateBillPDF = (req, res) => {
//     const Serchdata = {
//         bill_id: req.body.bill_id,
//         customer_id: req.body.customer_id,
//         hawker_id: req.body.hawker_id,
//     };
//     console.log(Serchdata);

//     const t = new Date();
//     const x = moment(t).format('DD-MM-YYYY HH:mm:ss');

//     const return_data = {};

//     const customWidth = 210 / 2;
//     const customHeight = 148;

//     browserPromise.then(browser => {
//         return browser.newPage();
//     })
//             .then(newPage => {
//                 page = newPage; // Assign newPage to the page variable
          
//                 // Set viewport size before setting content
//                 return page.setViewport({ width: customWidth, height: customHeight, deviceScaleFactor: 1.5  })
//                     .then(() => fs.readFile(path.join(__dirname, '../views/', "generatebill.ejs"), 'utf-8'));
//             })
//             .then(template => {
//                 const compiledTemplate = ejs.compile(template);
          
//                 return new Promise((resolve, reject) => {
//                     BillM.getBillPDF_details(Serchdata, (err, data) => {
//                         if (err) {
//                             // page.close(); // Close the page on error
//                             reject(err);
//                             return;
//                         }
          
//                         data['curr_date'] = x;
          
//                         const totalDays = countDaysBetweenDates(new Date(data.new_dates_start), new Date(data.new_dates_end));
          
//                         const extradata = [{
//                             totalDays: totalDays,
//                             startDate:  moment(data.new_dates_start, 'YYYY-MM-DD').format('DD-MM-YYYY'),
//                             endDate:   moment(data.new_dates_end, 'YYYY-MM-DD').format('DD-MM-YYYY'),
//                             bill_created_date:   moment(data.bill_created_date, 'YYYY-MM-DD').format('DD-MM-YYYY'),
//                             bill_no: data.bill_no,
//                             prev_balance: data.prev_balance,
//                         }];
          
//                         return_data['product_data'] = data;
//                         return_data['extra_data'] = extradata;
          
//                         const htmlContent = compiledTemplate({ response: data, response1: extradata });
          
//                         // <%= data.product_data[0].curr_date: %>
//                         page.setContent(htmlContent).then(() => {
//                             resolve({ page, pdfname: 'newbill' + new Date().getTime() + '.pdf' });
//                         });
//                     });
//                 });
//             })
//         .then(({ page, pdfname }) => {
//             return page.pdf({
//                 path: path.join(__dirname, '../uploads/bills/', pdfname),
//                 width: customWidth * 2.835,
//                 height: customHeight * 2.835,
//                 margin: { top: 0, right: 0, bottom: 0, left: 0 },
//                 printBackground: true
//             }).then(() => {
//                 const pdfurl = 'http://10.51.140.130:3005/uploads/' + pdfname;
//                 return { pdfurl, page };
//             });
//         }).then(({ pdfurl, page }) => {
//             if (pdfurl) {
//                 return_data['pdf_data'] = { "pdf_name": pdfurl };
//                 console.log('check return data');
//                 console.log(return_data);
//                 res.status(200).json({ status: true, msg: 'PDF generated successfully', data: return_data });
//             } else {
//                 res.status(500).json({ status: false, msg: 'PDF not found', data: null });
//             }
//             return page.close(); 
//         }).catch(error => {
//             console.error(error);
//             res.status(500).send('Error generating PDF');
//         }).finally(() => {
//             browser.close(); // Ensure the browser is closed after all operations
//         })    .catch(error => {
//         console.error('Error launching Puppeteer:', error);
//         res.status(500).send('Error launching Puppeteer');
//     });
// };

function countDaysBetweenDates(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const startTimestamp = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const nextDay = new Date(endDate.getTime() + oneDay); // Add one day to end date
    const endTimestamp = Date.UTC(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
    const daysDifference = Math.round(Math.abs((startTimestamp - endTimestamp) / oneDay));
    console.log(daysDifference);
    return daysDifference;
}