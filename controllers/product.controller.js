const ProductDetails = require('../models/product.model.js');

exports.create = (req, res) => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
   try{
  
    const productmaster = new ProductDetails({
      id: req.body.id,
      product_name: req.body.product_name,
      product_price: req.body.product_price,
      status:req.body.status,
      created_on:req.body.created_on,
      created_by:req.body.created_by
    });
  
    


  console.log("Product details to be saved:", productmaster);
  ProductDetails.create(productmaster, (err, data) => {
      if (err) {
        res.status(500).json({ status: false, message: err.message || "Some error occurred while adding product." });
      } else {
        res.status(200).json({ status: true, message: 'product added successfully', data: data });
      }
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send({
      message: "Internal Server Error"
    });
  }
};
//---------------------------------------------------------------------
//while adding a new product for a customer
exports.mapCustomerProduct = async function (req, res) {

  var moment = require('moment');
  
  let product = req.body.product_data;
  var final_data = [];
  var data = [];
  var datetime = new Date();
  for (let index = 0; index < product.length; index++) {

    console.log();
    let entry_date = moment(datetime,'DD-MM-YYYY').format('YYYY-MM-DD');
    console.log(entry_date);

    final_data.push([
      req.body.customer_id,
      product[index]['id'],
      product[index]['qty'],
      entry_date,
      req.body.hawker_id
    ]);

  }
  console.log(final_data);
  ProductDetails.insert_in_mapping(final_data, (err, results) => {
    let errorArray = [];
  if (err) {
   
                errorArray.push({ 
                  message: err.message
                  });

              

               
    res.status(500).json({ status: false, msg: 'Please try again' });
  }
  else {
  
                errorArray.push({ 
                  message: 'Customer Product Added Successfully'
                  });

              
    res.status(200).json({ status: true, msg: 'Customer Product Added Successfully', data: results });
  }
});

};





// to find the current product of the customer from the mapping table
exports.findCurrent=(req,res)=>{
  ProductDetails.getCurrent((err,data)=>{
    if(err){
      res.status(500).json({
        status:false,
        message: "Error retrieving current product"
      });
      
    }else{
      res.status(200).json({
        status:true,
        message:"Current Product retrieved successfully",
        data:data
      })
    }
  })
}

exports.getCustomerListForUpdate=(req,res)=>{
  
    // if (!req.body) {
    //   res.status(400).send({
    //     message: "Content can not be empty!"
    //   });
    // }
    let formdata={
      hawker_id:req.body.hawker_id,
    customer_id:req.body.customer_id}
    
    // console.log(formdata);
    ProductDetails.updateByHawkerIdandCustomerId(formdata,(err,data)=>{
     
       
        if (err) {
          // if (err.kind === "not_found") {
          //   res.status(404).send({
          //     status:false,
          //     message: `Not found Product with id ${req.params.hawker_id},${req.params.customer_id}.`
          //   });
          // } else {
            res.status(500).send({
              status:false,
              msg: "Error updating Product with id ",
              data:{}
            });
          
        } else
        res.send({
          status: true,
          msg: "Request successful .!!",
          data
        });
      }
    );
  };




//-------------------------------------------------------
//to find all products that are already defined
exports.findAll = (req, res) => {
  
    
    ProductDetails.getAll((err, data) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: `Error retrieving Product .`
      });
      } else {
        
          res.status(200).json({
              status: true,
              message: "Product retrieved successfully",
              data: data
          });
      }
  });
};



exports.findOne = (req, res) => {
  ProductDetails.findById(req.params.id, (err, data) => {
      if (err) {
          if (err.kind === "not_found") {
              res.status(404).json({
                  status: false,
                  message: `Not found Product with id ${req.params.id}.`
              });
          } else {
              res.status(500).json({
                  status: false,
                  message: `Error retrieving Product with id ${req.params.id}.`
              });
          }
      } else {
        
          res.status(200).json({
              status: true,
              message: "Product retrieved successfully",
              data: data
          });
      }
  });
};

exports.update = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Content can not be empty!" });
      return;
    }

    const data = await ProductDetails.updateById(req.params.id, req.body);
    res.status(200).json(data);
  } catch (error) {
    if (error.kind === "not_found") {
      res.status(404).json({ message: `Not found Product with id ${req.params.id}.` });
    } else {
      res.status(500).json({ message: "Error updating Product with id " + req.params.id });
    }
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await ProductDetails.remove(req.params.id);
    res.status(200).json({ message: `Product with id ${req.params.id} was deleted successfully!` });
  } catch (error) {
    if (error.kind === "not_found") {
      res.status(404).json({ message: `Not found Product with id ${req.params.id}.` });
    } else {
      res.status(500).json({ message: "Could not delete Product with id " + req.params.id });
    }
  }
};
