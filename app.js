const express = require('express');
//var path = require('path');
const bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
const bcrypt =require('bcryptjs');
const logger = require('morgan');

require('./db/mongoose');
const UserModel = require('./models/UserModel');
const TaskModel = require('./models/TaskModel');
const UserRouter = require('./routers/UserRouter');
const TaskRouter = require('./routers/TaskRouter');

const app = express();
//const port = process.env.PORT || 3000;

app.use(express.json());//Must be used to parse incoming data from browser body
app.use(logger('dev'));

//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use(UserRouter);
app.use(TaskRouter);



module.exports = app;
