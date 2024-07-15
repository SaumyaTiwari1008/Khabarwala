const MastersM=require("../models/support.model.js")

exports.getStateMaster = async function (req, res) {


    MastersM.getStateMaster((err, results) => {
      if (err) {
        // console.error('Error fetching users:', err);
        res.status(500).json({ status: false, msg: 'Data not found ,please try again' });
      }
      else {
        //  insert_data.push({uid:insert_data.id});
  
  
        res.status(200).json({ status: true, msg: 'Data Updated Successfully', data: results });
      }
    });
  
  };
  
  exports.getCityMaster = async function (req, res) {
  
    let where = new Array({
      id: req.body.state_id
  
    });
    //console.log(where);
  
    MastersM.getCityMaster(where, (err, results) => {
      if (err) {
        // console.error('Error fetching users:', err);
        res.status(500).json({ status: false, msg: 'Data not found ,please try again' });
      }
      else {
        //  insert_data.push({uid:insert_data.id});
  
  
        res.status(200).json({ status: true, msg: 'Data Updated Successfully', data: results });
      }
    });
  
  };
  