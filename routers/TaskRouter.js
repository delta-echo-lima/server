const express = require('express');
const TaskCollection = require("../models/TaskModel");
const auth = require('../middleware/auth');
const router = express.Router();

//Create a new user from the user model using request body (from forms)
router.post('/tasks', auth, async (req,res) => {
    //const task = new TaskCollection(req.body);
    const task = new TaskCollection({
        ...req.body,
        owner: req.user._id // the owner id that is on the req.user
    })
    try{
        await task.save();
        res.status(201).send({ success:true, task:task });
    }catch(error){
        res.status(400).send(error);
    }
})

//Get all task, if good send task, if error send error
router.get('/tasks', auth, async (req,res) => {
    try{
        //const tasks =  await TaskCollection.find({owner:req.user._id});
        await req.user.populate('tasks');
        res.status(201).send({success:true, task: req.user.tasks});//populate task off the req.user
    }catch(error){
        res.status(400).send(error);
    }
})

//Get task by id from request parameter, filtered by the owner of the ID if good send task, if fail send error
router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = (req.params.id );
    try{
        //const task = await TaskCollection.findById the task.ID filter by users' owner.ID
        //_id is the value saved in database for all ID's
        const task = await TaskCollection.findOne({ _id:req.params.id, owner:req.user.id })
        if(!task){
            return res.status(404).send({ success:false });
        }
        res.status(201).send({ success:true, task:task });
    }catch (error){
        res.status(500).send(error);
    }
})

//Update tasks
router.patch('/tasks/:id', auth, async (req,res) => {
    const update = Object.keys(req.body)//Get the keys from requested update
    const allowedUpdates = ['description','completed'];//Set the allowed updates on model fields
    const isValidUpdate = update.every((update)=> allowedUpdates.includes(update));//check every update requested to allowed updates
    if(!isValidUpdate){
        return res.status(400).send({ success:false, message:'Invalid update.' }); //invalid update, stop and send to browser
    }try{
        //const task = await TaskCollection.findById(req.params.id);//Find task from DB save as task
        //Update Task by task.id matched by owner.id which is same as user id (_id is always ID for DB)
        const task = await TaskCollection.findOne({_id:req.params.id, owner:req.user._id})
        //go through all updates must use bracket notation because updates are dynamic
        if(!task){
            return res.status(404).send({ success:false, message:'Task not found.' });//No task found set status send to browser
        }
        update.forEach((update) => task[update] = req.body[update]);
        await task.save();//ensures tasks are re-saved in DB collection
        res.send({success:true, task: task, message: 'Task updated.' });//Task updated, send back updated user
    }catch(error){
        res.status(400).send(error);//log any unexpected errors
    }
})

//Delete Task
router.delete('/tasks/:id', auth, async (req,res)=>{
    try{
        //const task = await TaskCollection.findByIdAndDelete(req.params.id);//save task found in db
        const task = await TaskCollection.findByIdAndDelete({ _id:req.params.id, owner:req.user._id });
        if(!task){
            res.status(400).send({ success:false, message:'No task found.' });//No user found to delete
        }
        res.status(200).send({ success:true, task:task, message:'Task was deleted.' })//Send back deleted user info
    }catch(error){
        res.status(500).send(error);//Send Error
    }
})

module.exports = router;