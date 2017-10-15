const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose');
const fs = require('fs')
const os = require('os')
const expressjwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
var config = require('./config')

var app = express() ;

app.use(cors());
app.use(cookieParser('LOL-my-Secret-dam'));
app.use(bodyparser.json())
app.use(bodyparser({urlencoded : true}))




var port = config.port
app.jwt = jwt;
app.bcrypt = bcrypt;
app.expressjwt = expressjwt;
app.config = config ;

global.__base = __dirname ;



var request = require('request');
var token = "38936697bd54da1c86dbf68e737f49cd60492d5a8c31d7ce4b6b76bce1450b06";
//app.use('*', require('./middleware/decodeJWT').decodeToken);

app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
    console.log(config.mongodb.uri);
});

import {models} from './models';
models(app, mongoose);
import {indexRoute} from './app/routes';
indexRoute(app);
app.listen(port , () =>{
console.log('server running on :'+ port)
})
