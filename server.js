import express from "express";
import bodyparser from "body-parser";
import mongoose from "mongoose";
import fs from "fs";
import os from "os";
import expressjwt from "express-jwt";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import { port, mongodb } from './config';

global.__base = __dirname;
global.Promise = mongoose.Promise;

const app = express();

app.use(cors());
app.use(cookieParser('LOL-my-Secret-dam'));
app.use(bodyparser.json())
app.use(bodyparser({ urlencoded: true }))


app.jwt = jwt;
app.bcrypt = bcrypt;
app.expressjwt = expressjwt;

app.db = mongoose.createConnection(mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
	console.log(mongodb.uri);
});

import { models } from './models';
models(app, mongoose);
import { indexRoute } from './app/routes';
indexRoute(app);

app.listen(port, () => {
	console.log('server running on :' + port)
});
