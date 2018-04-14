const router = require('express').Router();
const jwt = require('../configs/jsonwebtoken');
const database = require('../configs/database');
const password = require('../configs/password');
const mongo = require('mongodb');
var db;
router.use((req, res, next) => {
    db = database.getInstance();
    next();
})

var authenticate = (req, res, next) => {
    try {
        req.body.token_data = jwt.verifyToken(req.headers.authorization);
        console.log(req.body.token_data);
    } catch (Exception) {
        console.log(Exception);
        res.status(401).json({ message: "Unauthorized Acccess" });
        return;
    }
    next();
}

router.post('/saveAttendance',(req,res,next)=>{
    authenticate(req,res,next)
},(req,res,next)=>{
    req.body._id = mongo.ObjectID(req.body._id);
    req.body.address_name = req.body.token_data.address;
    delete req.body.token_data;
    db.collection('attendance').update({ group_id : req.body.group_id, date : req.body.date }, req.body ,{upsert : true},(err,data)=>{
        if(err){
            console.log(err);
            res.status(404).json({devMessage : "Error From Database", message : "Insert Unsuccessful"})
        }else{
            res.json({devMessage : "Success", message : "Insert Successful",data});    
        }
    })
})


router.get('/getDates/:group_id',(req,res,next)=>{
    authenticate(req,res,next);
},(req,res,next)=>{
    db.collection('attendance').find({ group_id : req.params.group_id }).project({ _id : 0, date : 1}).toArray((err,data)=>{
        if(err){
            console.log(err);
            res.json({devMessage : "Error From Database", message : "No Data Found"})
        }else{
            res.json(data);    
        }
    })
})

router.get('/getGroupById/:id',(req,res,next)=>{
    authenticate(req,res,next);
},(req,res,next)=>{
    db.collection('groups').find({ _id : mongo.ObjectID(`${req.params.id}`)}).toArray((err,data)=>{
        if (err) {
            console.log(err);
            res.json({ devmessage: 'Error from database', message: 'No Data Found', color: "red" })
        } else {
            res.json( data[0] );
        }
    })
})

router.get('/attendanceByStudentId/:id',(req,res,next)=>{
    authenticate(req,res,next)
},(req,res,next)=>{
    db.collection('attendance').aggregate([ {$unwind :  "$attendance" },{ $match : { "attendance.id" : req.params.id }}, { $project : { date : 1, attendance : 1}}]).toArray((err,data)=>{
        if(err){
            console.log(err);
            res.json({ devmessage: 'Error from database', message: 'No Data Found', color: "red" })
        }else{
            console.log(data)
            res.json({ devMessage : "success", data : data})
        }
    })
})

router.get('/attendance/:id/:date',(req,res,next)=>{
    authenticate(req,res,next);
},(req,res,next)=>{
    db.collection('attendance').find({ group_id : req.params.id, date : req.params.date}).toArray((err,data)=>{
        if (err) {
            console.log(err);
            res.json({ devmessage: 'Error from database', message: 'No Data Found', color: "red" })
        } else {
            if(data.length > 0){
                res.json(data);
            }else{
                db.collection('groups').find({ _id : mongo.ObjectID(`${req.params.id}`)}).toArray((err,data)=>{
                    if (err) {
                        console.log(err);
                        res.json({ devmessage: 'Error from database', message: 'No Data Found', color: "red" })
                    } else {
                        res.json(data)
                    }
                })
            }
            
        }
    })
})

router.get('/getGroups',(req,res,next)=>{
    authenticate(req,res,next);
},(req,res,next)=>{
    let query;
    try{
        if(req.body.token_data.username == 'admin') query = {};
        else if ('address' in req.body.token_data) query = { address_name : req.body.token_data.address};
        else if ('teacher' in req.body.token_data) query = { teachers : req.body.token_data.teacher }; 
    }catch(exception){
        res.json({ devmessage: exception, message: 'No Data Found', color: "red" })
    }
    db.collection('groups').find(query).project({ group_name : 1, address_name : 1 }).toArray((err,data)=>{
        if (err) {
            console.log(err);
            res.json({ devmessage: 'Error from database', message: 'No Data Found', color: "red" })
        } else {
            res.json({ devmessage: 'Success', message: 'Sparat', color: "green", groups : data })
        }
    })
})

router.get('/getMessages',(req,res)=>{
    db.collection('users').find({ "username" : "admin"}).project({ _id : 0, messages : 1}).toArray((err,data)=>{
        if(err) res.json({devMessage : err, message : "Creation Failed" })
        else res.json({devMessage : "Success", message : "Success", data : data[0].messages })
    })
})

module.exports = router;