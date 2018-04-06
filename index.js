const express = require('express');
const path = require('path');
const cors = require('cors');
const database = require('./configs/database');
const login = require('./routes/login');
const admin = require('./routes/admin');
const address = require('./routes/address');

const app = express();

app.use(express.json());
app.use(express.json({ urlencoded: true }));
app.use(cors());
app.use(express.static(path.join(__dirname,'dist')));

database.createInstance();

app.use(login);
app.use(address);
app.use(admin);

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'dist/index.html'));
})

var port = process.env.PORT || '3000';
app.listen(port,()=>{
    console.log(`Listening at ${port}`);
})