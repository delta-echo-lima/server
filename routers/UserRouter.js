const express = require('express');
const UserCollection = require("../models/UserModel");//User is the name of collection in the DB
const auth = require('../middleware/auth');
const router = express.Router();

//Create a new user from the user model using request body (from forms)
router.post('/users', async (req, res) => {
    const user = new UserCollection(req.body);
    try {
        await user.save();// (resolved) try this, if it works send status and user
        const token = await user.generateAuthToken();//Generate auth token
        res.status(201).send({user,token});
    } catch (error) {
        res.status(400).send(error);// (rejected) if save not complete
    }
})

//Login Use
router.post('/users/login', async (req, res) => {
    try {
        const user = await UserCollection.findByCredentials(req.body.email, req.body.password);//Find user by email
        const token = await user.generateAuthToken();//Generate a token from function in the model
        res.status(200).send({user, token});
    } catch (e) {
        res.status(400).send();
    }
})

//logout user
router.post('/users/logout', auth, async (req,res) => {
    try{
        //look at current token with the token property not equal to current req.token
        //if not current request token, keep it in the token array on user which means other token is for
        //another device, tablet, phone, desktop ect.. if false, token gets removed
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();//save the user without saved token
        res.status(200).send();//send back the good news, token removed, that will invalidate the auth on user
    }catch(error) {
        res.send(500).send();
    }
})

//logout all sessions removing all saved tokens
router.post('/users/logout-all', auth,async (req,res) => {
    try{
        req.user.tokens = [];//replace user tokens array with empty array
        req.user.save();//save  the new tokens array
        res.status(200).send();//send status
    }catch (error){
        res.status(500).send();//something went wrong
    }
})

//Get user that is currently logged in
router.get('/users/me', auth, async (req, res) => {
    //const publicProfile = await user.getPublicProfile();//Create public profile to hide some user data
    res.send(req.user);
})

//Update the current user
router.patch('/users/me', auth, async (req, res) => {
    const update = Object.keys(req.body);//Get the keys from requested update
    const allowedUpdates = ['name', 'password', 'email', 'age'];//Set the allowed updates on model fields
    const isValidUpdate = update.every((update) => allowedUpdates.includes(update));//check every update requested to allowed updates
    if (!isValidUpdate) {
        return res.status(400).send('Invalid update.'); //invalid update, stop and send to browser
    }
    try {
        //go through all updates, must use bracket notation because updates are dynamic
        update.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();//ensures if password is changed it is rehashed in the pre('save') function in the model
        res.send({ user: req.user, message: 'Profile Updated.' });//UserRouter updated, send back updated user
    }catch(error) {
        res.status(400).send();//log any unexpected errors
    }
})

//Delete the current user Profile in the DB,'auth gives access to the current user for req.user_id,
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();//Remove the users profile from the database, this is permanent
        res.status(200).send({ user: req.user, message: 'User deleted.' })//Send back deleted user info and message
    }catch (error) {
        res.status(500).send(error);//Send Error
    }
})

//-----------------ADMIN ROUTES-------------------------------//
//ADMIN ROUTE Get all users,if good send, if error send error
router.get('/users', auth, async (req, res) => {
    try {
        const users = await UserCollection.find({});// (resolved) Try to get all users, send status and users
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);// (rejected) send status and error
    }
})

//Get User by id from request parameter, if good send User, if fail send error
router.get('/users/:id', async (req, res) => {
    const _id = (req.params.id);
    try {
        const user = await UserCollection.findById(_id);
        if (!user) {
            return res.status(404).send(error);
        }
        res.status(201).send(user);
    }catch (error) {
        res.status(500).send(error);
    }
})

//ADMIN Update users
router.patch('/users/:id', async (req, res) => {
    const update = Object.keys(req.body);//Get the keys from requested update
    const allowedUpdates = ['name', 'password', 'email', 'age'];//Set the allowed updates on model fields
    const isValidUpdate = update.every((update) => allowedUpdates.includes(update));//check every update requested to allowed updates
    if (!isValidUpdate) {
        return res.status(400).send('Invalid update.'); //invalid update, stop and send to browser
    }
    try {
        const user = await UserCollection.findById(req.params.id);//Find user from DB save as user
        //go through all updates, must use bracket notation because updates are dynamic
        update.forEach((update) => user[update] = req.body[update]);
        await user.save();//ensures if password is changed it is rehashed in the pre('save') function in the model
        if (!user) {
            return res.status(404).res.send(error);//No user found set status send to browser
        }
        res.send(user);//UserRouter updated, send back updated user
    }catch(error) {
        res.status(400).send();//log any unexpected errors
    }
})

//Delete UserRouter
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await UserCollection.findByIdAndDelete(req.params.id);//save user found in db
        if (!user) {
            res.status(400).send('No user found.');//No user found to delete
        }
        res.status(200).send(user)//Send back deleted user info
    }catch (error) {
        res.status(500).send(error);//Send Error
    }
})

module.exports = router;