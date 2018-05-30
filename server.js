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
import { port,mongodb } from './config';
import bunyan from 'bunyan';
import bunyanFormat from 'bunyan-format';
import http from 'http';
import webSocket from 'ws';

/*
* Logger
*/
const formatOut = bunyanFormat({ outputMode: 'short' });
const log = bunyan.createLogger({ name: 'app',stream: formatOut,level: 'debug' });

/*
* Globals
*/

global.__base = __dirname;
global.log = log;


const app = express();
const server = http.createServer(app);
const wss = new webSocket.Server({
	server
});

app.use(cors());
app.use(cookieParser('LOL-my-Secret-dam'));
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))


app.jwt = jwt;
app.bcrypt = bcrypt;
app.expressjwt = expressjwt;

app.db = mongoose.createConnection(mongodb.uri);
app.db.on('error',console.error.bind(console,'mongoose connection error: '));
app.db.once('open',() => {
	log.info("Connected to database ");
	log.info(mongodb.uri);
});

import { models } from './models';
models(app,mongoose);
import { indexRoute } from './app/routes';
indexRoute(app);

global.userSocket = {};
wss.on('connection',function connection(ws,req) {
	let userId = req.url.split('/')[1];
	userSocket[userId] = ws;
	log.info(userId,"is online");
	userSocket[userId].send("ping");
});


server.listen(port,() => {
	log.info("Starting server")
	log.info("Port used",port)
	log.info(`Listening at http://127.0.0.1:${port}`);
});

process.on('SIGINT',() => {
	console.log("");
	log.info("Received SIGINT");
	log.info("Stoping api service");
	log.info("Shutting down server");
	process.exit(0)
});
