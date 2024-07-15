const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=> {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(403).send({
                                  status: false,
                                  message: "Un-Authorized Access..!!",
                                  data:{}
                              });
  
    jwt.verify(token, process.env.JWT_SECRETE_KEY, (err,decoded) => {
        
      console.log(decoded);
        if (err) return res.status(403).send({
                    status: false,
                    message: "Un-Authorized Access..!!",
                    data:{}
                });
        
                var isExpiredToken = false;
                //var seconds = 60000; //86400 24 hrs  //60000; for 1 min
                var d = new Date();
                var t = d.getTime();

                console.log(decoded);
                const myArray = decoded.username.split(" ");
                let token_time = myArray[1];

                if (token_time < t) {
                  // code...
                  isExpiredToken = true;
                  return res.status(403).send({
                    status: false,
                    message: "Token Expired..!!",
                    data:{}
                });
                }
              req.user = decoded;
              // console.log(t)
              // console.log(decoded)
      next()
    })
}
