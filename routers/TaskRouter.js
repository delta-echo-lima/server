const express = require('express');
const TaskCollection = require("../models/TaskModel");
const auth = require('../middleware/auth');
const router = express.Router();

//Create a new user from the user model using request body (from forms)
router.post('/tasks', auth, async (req,res) => {
    const task = new TaskCollection(req.body);
    try{
        await task.save();
        res.status(201).send(task);
    }catch(error){
        res.status(400).send(error);
    }
})
//Get all task, if good send task, if error send error
router.get('/tasks', async (req,res) => {
    try{
        const tasks =  await TaskCollection.find({});
        res.status(201).send(tasks);
    }catch(error){
        res.status(400).send(error);
    }
})
//Get task by id from request parameter, if good send task, if fail send error
router.get('/tasks/:id',async (req,res)=>{
    //const _id = (req.params.id );
    try{
        const task = await TaskCollection.findById(req.params.id);
        if(!task){
            return res.status(404).send(error);
        }
        res.status(201).send(task);
    }catch (error){
        res.status(500).send(error);
    }
})
//Update tasks
router.patch('/tasks/:id',async (req,res) => {
    const update = Object.keys(req.body)//Get the keys from requested update
    const allowedUpdates = ['description','completed'];//Set the allowed updates on model fields
    const isValidUpdate = update.every((update)=> allowedUpdates.includes(update));//check every update requested to allowed updates
    if(!isValidUpdate){
        return res.status(400).send('Invalid update.'); //invalid update, stop and send to browser
    }try{
        const task = await TaskCollection.findById(req.params.id);//Find task from DB save as task
        //go through all updates must use bracket notation because updates are dynamic
        update.forEach((update) => task[update] = req.body[update]);
        await task.save();//ensures tasks are re-saved in DB collection
        if(!task){
            return res.status(404).res.send(error);//No task found set status send to browser
        }
        res.send(task);//Task updated, send back updated user
    }catch(error){
        res.status(400).send();//log any unexpected errors
    }
})
//Delete User
router.delete('/tasks/:id',async (req,res)=>{
    try{
        const task = await TaskCollection.findByIdAndDelete(req.params.id);//save task found in db
        if(!task){
            res.status(400).send('No task found.');//No user found to delete
        }
        res.status(200).send(task)//Send back deleted user info
    }catch(error){
        res.status(500).send(error);//Send Error
    }
})

module.exports = router;