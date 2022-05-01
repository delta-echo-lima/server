jwt = require('jsonwebtoken');//validate auth tokens
UserCollection = require('../models/UserModel');//access to user collection db

const auth = async (req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','');//remove 'Bearer' in the token
        const decoded = jwt.verify(token,'thisismynewcourse');//check if valid token

        // Find user with ID that matches decoded ID stored in token, filtered by the token in the token array on the user
        const user = await UserCollection.findOne({ _id: decoded._id, 'tokens.token': token});
        if(!user){
            throw new Error();//No user found
        }
        req.token = token;//add the token to the request for logging out later, just nice to have on the req
        req.user = user;//add the user to the request from the user Authorized
        next()
    }catch (error){
        res.status(401).send({error: 'Please Authenticate.'})
    }
}
module.exports = auth;