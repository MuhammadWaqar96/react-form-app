const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bycrypt = require("bcrypt");
const saltRounds = 10;


var app = express();
app.use(cors());
app.use(express.json());




//Connect to database
const db = new sqlite3.Database("./test.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.log(err.message);
});

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"]

  if(!token){
    res.send("need token")
  }
  else{
    jwt.verify(token, "jwtSecret", (error, decoded) => {
      if(err){
        res.json({auth: false, message: "authentication failure"});
      }
      else{
        req.userId = decoded.id;
        next();
      }
    });
  }
};

app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.status(200).send("Authenticated")
})

 //login token
 app.use("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let sql = 'SELECT * FROM users WHERE username = ?;';

  db.run(sql, username, (err, result) => {
    if(err){
      res.send({ err: err});
    }

    if(result.length > 0){
      bycrypt.compare(password, result[0].password, (error, response) => {
        if(resposne){
          req.session.user = result;
          
          const id = result[0].id;
          const token = jwt.sign({id}, "jwtSecret", {
            expiresIn: 300,

          })
          
          res.status(200).send({auth: true, token: token, result: result});
        }
        else{
          res.status(400).send({ message: "Wrong username and password"}); 
        }
      })
    }
    else{
      res.send({message: "User doesnt exist"});
    }
  })

})

// get all employees
app.get("/employees", (req, res) => {
    db.all("SELECT * FROM employee;", (err, result) => {
        if(err) {
            console.log(err);
        }
        else{
            res.status(200).send(result);
        }
    })
});

// create employee
app.post("/create", (req, res) => {
    console.log(req.body);
  const requestDate = req.body.requestDate;
  const joiningDate = req.body.joiningDate;
  const employeeId = req.body.employeeId;
  const dob = req.body.dob;
  const employeeName = req.body.employeeName;
  const designation = req.body.designation;
  const department = req.body.department;
  const property = req.body.property;
  const status = "Progress"

  let sql = `INSERT INTO employee
  (requestDate, joiningDate, employeeId, dob, employeeName, designation, department, property, status)
  VALUES(?, ?, ?, ?, ?, ?, ?, ?,?);`;

  db.run(
    sql,
    [
      requestDate,
      joiningDate,
      employeeId,
      dob,
      employeeName,
      designation,
      department,
      property,
      status
    ],
    (err, result) =>  {
      if (err) {
        return console.error(err.message);
      }
    }
  );

  return res.status(200).send("success")
  
});

// app listening to port 3001
app.listen(3001, () => {
  console.log("Server successfully connected");
});
