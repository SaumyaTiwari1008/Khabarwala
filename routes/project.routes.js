module.exports = app => {
  const userdetails = require("../controllers/project.controller.js");
  const support = require("../controllers/support.controller.js");
  const authjwt = require('../middleware/authjwt');
  const addcustomer=require("../controllers/customer.controller.js");
  const productmaster=require("../controllers/product.controller.js");
  const generatebill=require("../controllers/bill.controller.js");
  const transaction=require("../controllers/transaction.controller.js");
  const pdf =require("../controllers/pdf.controller.js");

  app.get("/api/states", support.getStateMaster);
  app.post("/api/cities", support.getCityMaster);

  var router = require("express").Router();
    router.post("/", userdetails.create);
    router.get("/:userid",userdetails.findOne);
    router.post("/login",userdetails.login);
  app.use('/api/userdetails',router);
                                                              
  var router1 = require("express").Router();
    router1.post("/",addcustomer.create)
    router1.post("/findAllCustomer/",addcustomer.findAll)
    router1.get("/findOneCustomer/:id",addcustomer.findOne)
    router1.put("/updateCustomer/:id", addcustomer.update);
    router1.delete("/deleteCustomer/:id",addcustomer.delete);
  app.use('/api/addcustomer', router1);

  var router2=require("express").Router();
    router2.post("/",productmaster.create)//to add new product to the list of products available to choose from
    router2.get("/getAllproducts",productmaster.findAll)
    router2.post("/mapCustomerProduct",productmaster.mapCustomerProduct)//maps the product and the customer
    router2.get("/findCurrentProducts",productmaster.findCurrent)
    router2.post("/displaycurrent",productmaster.getCustomerListForUpdate)//displays the current subscription of product
    
    //instead of making a multi-argument get req we can use post and pass the arguments in the body in raw JSON
  app.use('/api/productmaster',router2); 

  
  
  var router3=require("express").Router();
     router3.post("/",generatebill.generatenewBill)
     router3.post("/billdetails",generatebill.getProductDataForBill)
     router3.post("/getBalanceHistory",generatebill.getBalanceHistory)
     router3.post("/collectPayment",generatebill.collectPayment)
  app.use("/api/generate_bill_mst",router3);   

  
  
  var router4=require("express").Router();
     router4.post("/",transaction.create)
  app.use("/api/transaction_master",router4); 
  
  
  var router5=require("express").Router();
    router5.post("/",pdf.generateBillPDF)
    router5.post("/lastbill",pdf.lastbillpdf)
  app.use("/api/pdf",router5);
 
};

 