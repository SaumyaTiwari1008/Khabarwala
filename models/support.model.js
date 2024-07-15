const sql = require('./db.js')

 
  module.exports.getStateMaster = async(result) => {
 
    sql.query("select state_id,state_code,state_name as name from  states ",  (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
    
       // console.log("User  Added: ", { id: res.insertId, ...newuser });
        
       result(null, res);
      });
  };


   
  module.exports.getCityMaster =  (where,result) => {
 
    sql.query("select city_code ,city_name from  cities where state_id="+where[0].id,  (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
    
       // console.log("User  Added: ", { id: res.insertId, ...newuser });
        
       result(null, res);
      });
  };