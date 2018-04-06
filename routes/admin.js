const router = require('express').Router();
const jwt = require('../configs/jsonwebtoken');
const database = require('../configs/database');
const password = require('../configs/password');
const multer = require('multer');
const excelToJson = require('convert-excel-to-json');
const mongo = require('mongodb');

var db, data;
router.use((req, res, next) => {
    db = database.getInstance();
    next();
})

var authenticate = (req, res, next) => {
    try {
        data = jwt.verifyToken(req.headers.authorization);
        console.log(data);
        if (data.username == 'admin') {
            console.log("ASCDS");
            next();
        } else {
            res.status(401).json({ message: "Unauthorized Acccess" })
        }
    } catch (Exception) {
        console.log(Exception);
        res.status(401).json({ message: "Unauthorized Acccess" });
        return;
    }
}

router.post('/create/:role', (req, res, next) => {
    authenticate(req, res, next);
}, (req, res, next) => {
    try {
        var pd = password.createPassword(req.body.password);
        req.body.password = pd.passwordHash;
        req.body.salt = pd.salt;
        req.body.role = req.params.role;
    } catch (exception) {
        res.status(400).json({ devMessage: exception, message: "Password Invalid" })
    }

    db.collection('users').save(req.body, (err, data) => {
        if (err) {
            res.status(400).json({ devMessage: "Error From Data Base", message: "Username Already Exist" })
        } else {
            res.status(200).json({ devMessage: "Success", message: "Successfully Created", data: data.ops[0] })
        }
    })
})


router.put('/update', (req, res, next) => {
    authenticate(req, res, next);
}, (req, res, next) => {
    if (password in req.body) {
        var ps = password.createPassword(req.body.password);
        req.body.password = ps.passwordHash;
        req.body.salt = ps.salt;
    }
    req.body._id = mongo.ObjectID(req.body._id);
    console.log(req.body);
    db.collection('users').update({ _id: req.body._id }, { $set: req.body }, (err, data) => {
        if (err) {
            console.log(err);
            res.status(404).json({ devMessage: "Error From Data Base", message: "Username Already Exist" });
        }
        else {
            res.status(200).json({ devMessage: "Success", message: "Successfully Updated" })
        }
    })
})

router.delete('/delete/:username', (req, res, next) => {
    authenticate(req, res, next);
}, (req, res, next) => {
    // authenticate(req,res,next);
    db.collection('users').remove({ username: req.params.username }, (err, data) => {
        if (err) res.status(404).json({ devMessage: "Error From Data Base", message: "Unsuccessful" });
        else {
            if (data.n <= 0) res.status(404).json({ devMessage: "Error From Data Base", message: "Unsuccessful" });
            else res.status(200).json({ devMessage: "Success", message: "Successfully Updated", data: data })
        }
    })
})

router.get('/getUsers/:role', (req, res, next) => {
    authenticate(req, res, next);
}, (req, res, next) => {
    console.log(req.body);
    // authenticate(req,res,next);
    db.collection('users').find({ role: req.params.role }).toArray((err, data) => {
        if (err) res.status(404).json({ devMessage: "Error From database", message: "Not Found" })
        else {
            res.status(200).json(data)
        }
    })
})

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, req.filename + '-' + `${(new Date()).getTime()}` + '.xlsx')
    }
})

var upload = multer({ storage: storage });

router.post('/uploadStudents', (req, res, next) => {
    authenticate(req, res, next);
}, upload.single('avatar'), (req, res, next) => {
    console.log(req.file);
    var result = excelToJson({
        sourceFile: `${req.file.path}`,
    });
    console.log(result);
    result = structureIt(result);

    var bulkUpdateOps = result.map(function (student) {
        return {
            "updateOne": {
                "filter": { "group_name": student.group_name, "address_name": student.address_name },
                "update": { "$push": { students: { name: student.name, completed: false, _id: mongo.ObjectID() } }, "$addToSet": { teachers: student.teacher } },
                "upsert": true
            }
        };
    });

    db.collection('groups').bulkWrite(bulkUpdateOps, function (err, data) {
        if (err) {
            console.log(err);
            res.json({ devmessage: 'Error from database', message: 'Sparning misslyckades', color: "red" })
        } else {
            res.json({ devmessage: 'Success', message: 'Sparat', color: "green" })
        }
    })
})

var structureIt = (data) => {
    var excelSheets = Object.keys(data);
    var output = [];
    for (let sheet of excelSheets) {
        var columns = Object.keys(data[sheet][0]);
        for (let row = 1; row < data[sheet].length; row++) {
            var student = {};
            for (let column of columns) {
                if (data[sheet][0][column] == 'Namn') {
                    student['name'] = data[sheet][row][column];
                } else if (data[sheet][0][column] == 'Gruppaktivitets grupp') {
                    student['group_name'] = data[sheet][row][column];
                } else if (data[sheet][0][column] == 'Tillhör Kontor') {
                    student['address_name'] = data[sheet][row][column];
                } else if (data[sheet][0][column] == 'Ansvarig medarbetare') {
                    student['teacher'] = data[sheet][row][column];
                }
            }
            output.push(student);
        }
    }
    return output;
}

module.exports = router;