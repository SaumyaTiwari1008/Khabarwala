const Transac=require("../models/transaction.model.js") 

exports.create=(req,res)=>{
    if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
      }

      try{
        // Create a Transaction
        const transac = new Transac({
            id:req.body.id,
            transaction_id:req.body.transaction_id, 
            customer_id:req.body.customer_id,
            bill_id:req.body.bill_id,
            collection_id:req.body.collection_id,
            collection_amount:req.body.collection_amount,
            customer_product_map_id:req.body.customer_product_map_id,
            addon_id:req.body.addon_id,
            billed_date:req.body.billed_date,
            billed_month:req.body.billed_month,
            billed_year:req.body.billed_year,
            trans_type:req.body.trans_type,
            trans_status:req.body.trans_status,
            created_date:req.body.created_date,
            created_by:req.body.created_by,
        });  
        console.log("Transaction details:", transac);
        Transac.create(transac, (err, data) => {
            if (err) {
              res.status(500).json({ status: false, message: err.message || "Some error occurred while saving transaction." });
            } else {
              res.status(200).json({ status: true, message: 'transaction added successfully', data: data });
            }
          });
        } catch (error) {
          console.error('Error adding transaction:', error);
          res.status(500).send({
            message: "Internal Server Error"
          });
        }
}
// exports.update = async (req, res) => {
//     try {
//       if (!req.body) {
//         res.status(400).json({ message: "Content can not be empty!" });
//         return;
//       }
  
//       const data = await Transac.updateById(req.params.id, req.body);
//       res.status(200).json(data);
//     } catch (error) {
//       if (error.kind === "not_found") {
//         res.status(404).json({ message: `Not found Transaction with id ${req.params.id}.` });
//       } else {
//         res.status(500).json({ message: "Error updating Transaction with id " + req.params.id });
//       }
//     }
//   };
  
//   exports.delete = async (req, res) => {
//     try {
//       const data = await Transac.remove(req.params.id);
//       res.status(200).json({ message: `Transaction with id ${req.params.id} was deleted successfully!` });
//     } catch (error) {
//       if (error.kind === "not_found") {
//         res.status(404).json({ message: `Not found Transaction with id ${req.params.id}.` });
//       } else {
//         res.status(500).json({ message: "Could not delete Transaction with id " + req.params.id });
//       }
//     }
//   };
//   exports.findOne = (req, res) => {
//     Transac.findById(req.params.id, (err, data) => {
//         if (err) {
//             if (err.kind === "not_found") {
//                 res.status(404).json({
//                     status: false,
//                     message: `Not found Transaction with id ${req.params.id}.`
//                 });
//             } else {
//                 res.status(500).json({
//                     status: false,
//                     message: `Error retrieving Transaction with id ${req.params.id}.`
//                 });
//             }
//         } else {
          
//             res.status(200).json({
//                 status: true,
//                 message: "Transaction retrieved successfully",
//                 data: data
//             });
//         }
//     });
// };


    //  exports.collectionDetails=(req,res)=>{
    //   Transac.collectionInfo((err,data)=>{

    //   })
    //  }
