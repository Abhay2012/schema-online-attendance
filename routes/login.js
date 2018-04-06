const router = require('express').Router();
const jwt = require('../configs/jsonwebtoken');
const database = require('../configs/database');
const password = require('../configs/password');

var db;

router.use((req, res, next) => {
    db = database.getInstance();
    next();
})

router.post('/login', (req, res, next) => {
    db.collection('users').find({ "username": req.body.username }).toArray((err, data) => {
        if (err) {
            res.status(400);
            res.json({ devMessage: "Error From Database", message: "Bad Credentials", color: "red" })
        } else {
            if (data.length == 0) {
                res.status(400);
                res.json({ devMessage: "Error From Database", message: "Username Does Not Exist", color: "red" })
            } else {
                if (password.matchPassword(req.body.password, data[0].salt).passwordHash != data[0].password) {
                    res.status(400);
                    res.json({ devMessage: "Error From Database", message: "Password Incorrect", color: "red" })
                } else {
                    res.status(200);
                    let payload = { username: req.body.username }
                    try{
                        if (data[0].role == 'address') payload['address'] = data[0].address;
                        if (data[0].role == 'teacher') payload['teacher'] = data[0].teacher;
                    }catch(exception){
                        res.status(400);
                    res.json({ devMessage: exception, message: "Password Incorrect", color: "red" })
                    }
                    res.json({ devMessage: "Login Success", message: "Login Success", color: "red", token: jwt.createToken(payload), data: data });
                }
            }
        }
    })
})

module.exports = router;