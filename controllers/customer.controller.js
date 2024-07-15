const AddCustomer = require('../models/customer.model.js');
require('dotenv').config();
//const jwt = require('jsonwebtoken');
const authjwt = require('../middleware/authjwt');


exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
   try{
    // Create a Customer
    const addcustomer = new AddCustomer({
      id: req.body.id,
      customername: req.body.customername,
      mobno: req.body.mobno,
      address:req.body.address,
      created_by:req.body.created_by
    });
  
    


  console.log("Customer details to be saved:", addcustomer);
  AddCustomer.create(addcustomer, (err, data) => {
      if (err) {
        res.status(500).json({ status: false, message: err.message || "Some error occurred while adding customer." });
      } else {
        res.status(200).json({ status: true, message: 'customer added successfully', data: data });
      }
    });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).send({
      message: "Internal Server Error"
    });
  }
};
 


  
//     AddCustomer.getAll(title, (err, data) => {
//       if (err)
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while retrieving customer."
//         });
//       else res.send(data);
//     });
//   };

//   exports.update = (req, res) => {
    
//     if (!req.body) {
//       res.status(400).send({
//         message: "Content can not be empty!"
//       });
//     }
  
//     console.log(req.body);
  
//     AddCustomer.updateById(
//       req.params.id,
//       new AddCustomer(req.body),
//       (err, data) => {
//         if (err) {
//           if (err.kind === "not_found") {
//             res.status(404).send({
//               message: `Not found Customer with id ${req.params.id}.`
//             });
//           } else {
//             res.status(500).send({
//               message: "Error updating Customer with id " + req.params.id
//             });
//           }
//         } else res.send(data);
//       }
//     );
//   };

//   exports.delete = (req, res) => {
//     AddCustomer.remove(req.params.id, (err, data) => {
//       if (err) {
//         if (err.kind === "not_found") {
//           res.status(404).send({
//             message: `Not found Customer with id ${req.params.id}.`
//           });
//         } else {
//           res.status(500).send({
//             message: "Could not delete Customer with id " + req.params.id
//           });
//         }
//       } else res.send({ message: `Customer was deleted successfully!` });
//     });
//   };

exports.findAll = (req, res) => {
  
    console.log(req)
      AddCustomer.getAll(req.body.created_by,(err, data) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: `Error retrieving Customer .`
        });
        } else {
          
            res.status(200).json({
                status: true,
                message: "Customer retrieved successfully",
                data: data
            });
        }
    });
  };
 
  exports.findOne = (req, res) => {
    AddCustomer.findById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).json({
                    status: false,
                    message: `Not found Customer with id ${req.params.id}.`
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: `Error retrieving Customer with id ${req.params.id}.`
                });
            }
        } else {
          
            res.status(200).json({
                status: true,
                message: "Customer retrieved successfully",
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
  
      const data = await AddCustomer.updateById(req.params.id, req.body);
      res.status(200).json(data);
    } catch (error) {
      if (error.kind === "not_found") {
        res.status(404).json({ message: `Not found Customer with id ${req.params.id}.` });
      } else {
        res.status(500).json({ message: "Error updating Customer with id " + req.params.id });
      }
    }
  };
  
  exports.delete = async (req, res) => {
    try {
      const data = await AddCustomer.remove(req.params.id);
      res.status(200).json({ message: `Customer with id ${req.params.id} was deleted successfully!` });
    } catch (error) {
      if (error.kind === "not_found") {
        res.status(404).json({ message: `Not found Customer with id ${req.params.id}.` });
      } else {
        res.status(500).json({ message: "Could not delete Customer with id " + req.params.id });
      }
    }
  };

  //to implement a function to collect payment and update the collection_master table 
  



// const AddCustomer = require('../models/customer.model.js');
// require('dotenv').config();
// const verifyToken = require('../middleware/authjwt');

// // Middleware for routes that require JWT
// exports.create = [verifyToken, (req, res) => {
//     if (!req.body) {
//         return res.status(400).send({
//             message: "Content can not be empty!"
//         });
//     }

//     try {
//         const addcustomer = new AddCustomer({
//             id: req.body.id,
//             customername: req.body.customername,
//             mobno: req.body.mobno,
//             address: req.body.address
//         });

//         AddCustomer.create(addcustomer, (err, data) => {
//             if (err) {
//                 return res.status(500).json({ status: false, message: err.message || "Some error occurred while adding customer." });
//             } else {
//                 return res.status(200).json({ status: true, message: 'Customer added successfully', data: data });
//             }
//         });
//     } catch (error) {
//         console.error('Error adding customer:', error);
//         return res.status(500).send({
//             message: "Internal Server Error"
//         });
//     }
// }];

// exports.findAll = [verifyToken, (req, res) => {
//     AddCustomer.getAll((err, data) => {
//         if (err) {
//             return res.status(500).json({
//                 status: false,
//                 message: "Error retrieving Customer."
//             });
//         } else {
//             return res.status(200).json({
//                 status: true,
//                 message: "Customer retrieved successfully",
//                 data: data
//             });
//         }
//     });
// }];

// exports.findOne = [verifyToken, (req, res) => {
//     AddCustomer.findById(req.params.id, (err, data) => {
//         if (err) {
//             if (err.kind === "not_found") {
//                 return res.status(404).json({
//                     status: false,
//                     message: `Not found Customer with id ${req.params.id}.`
//                 });
//             } else {
//                 return res.status(500).json({
//                     status: false,
//                     message: `Error retrieving Customer with id ${req.params.id}.`
//                 });
//             }
//         } else {
//             return res.status(200).json({
//                 status: true,
//                 message: "Customer retrieved successfully",
//                 data: data
//             });
//         }
//     });
// }];

// exports.update = [verifyToken, async (req, res) => {
//     try {
//         if (!req.body) {
//             return res.status(400).json({ message: "Content can not be empty!" });
//         }

//         const data = await AddCustomer.updateById(req.params.id, req.body);
//         return res.status(200).json(data);
//     } catch (error) {
//         if (error.kind === "not_found") {
//             return res.status(404).json({ message: `Not found Customer with id ${req.params.id}.` });
//         } else {
//             return res.status(500).json({ message: "Error updating Customer with id " + req.params.id });
//         }
//     }
// }];

// exports.delete = [verifyToken, async (req, res) => {
//     try {
//         const data = await AddCustomer.remove(req.params.id);
//         return res.status(200).json({ message: `Customer with id ${req.params.id} was deleted successfully!` });
//     } catch (error) {
//         if (error.kind === "not_found") {
//             return res.status(404).json({ message: `Not found Customer with id ${req.params.id}.` });
//         } else {
//             return res.status(500).json({ message: "Could not delete Customer with id " + req.params.id });
//         }
//     }
// }];
