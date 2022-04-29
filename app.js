const express = require('express');
//var path = require('path');
const bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
const bcrypt =require('bcryptjs');
const logger = require('morgan');

require('./db/mongoose');
const UserCollection = require('./models/UserModel');
const TaskCollection = require('./models/TaskModel');
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

const main = async () => {
    // const task = await TaskModel.findById('626b2e321996f210e09b082f')
    // const task2 = await task.populate('owner')
    // console.log(task2.name)

    //This will get all the task that a user made by users ID
    // const user = await UserCollection.findById('626b2e241996f210e09b082a')
    // await user.populate('tasks')
    // console.log(user.tasks)
}
main()
module.exports = app;
