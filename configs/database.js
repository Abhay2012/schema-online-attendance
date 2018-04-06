const mongodb = require('mongodb').MongoClient;
var database;
module.exports = {
    database,
    createInstance : () => {
        mongodb.connect('mongodb://Abhay2012:coolboy20@ds117729.mlab.com:17729/attendance',(err, client)=>{
            if(err) console.log("Not Connected");
            else{
                database = client.db("attendance");
                console.log("Connection SuccessFul")
            }       
        })
    },
    getInstance : () => {
        return database;
    }
}