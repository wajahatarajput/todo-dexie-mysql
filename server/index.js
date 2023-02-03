var mysql = require('mysql');
const express = require("express");
const app = express();
const cors = require("cors");
var bodyParser = require('body-parser');
var conn = mysql.createConnection({host:'localhost',database:'todo',user:'root',password:''});


app.use(cors());
var jsonParser = bodyParser.json();
app.get("/",(req,res)=>{
    res.send("Hello");
});

app.listen(process.env.PORT || 8000, ()=>{
    console.log("Server is Listening on PORT : 3000");
});

conn.connect((err)=>{
    if(err){
        console.log(err);
        return;
    }

    console.log("connection Successful");
});



app.post("/query",jsonParser, async (req,res)=>{
    let {query} = req.body;
    console.log(query)
    try{
        conn.query(query,(error,results,fields)=>{
            if(error)
                throw error;
            res.send(results);
        });
    } catch (error) {
        res.send(error);
    }
})

