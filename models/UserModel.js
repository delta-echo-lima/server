const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

/** CREATE A SCHEMA FOR MODELING DATA SENT TO DB*/
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Cannot contain the word "password"')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email not proper format')
            }
        }
    },
    age: {
        type: Number,
        default: 10,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number ')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required:true
        }
    }]
})

//Remove data that we want to keep hiding. This will run even though it is never called. It's built into Express
//and is actually called behind the scenes with JSON.stringify on the res.object that is returned. It's like jumping on
//a train that is already rolling for the user. It prevents having to call a function to hide data everytime the users' info
//is fetched without deleting it from the database.
userSchema.methods.toJSON = function () {
    const user = this;//the current user making the request
    const userObject = user.toObject();//cast user to an object
    //properties of user that should not be shown or exposed
    delete userObject.password;//Delete password from this user object before sending to hide data (Not done in DB)
    delete userObject.tokens;//delete auth tokens from this user object before sending back (Not done in DB)
    return userObject;//send back the user with props removed as json object. Abracadabra!
}

//Generate a users token with JWT
userSchema.methods.generateAuthToken = async function () {
    const user = this;//the user making request
    const token = jwt.sign({ _id: user._id }, 'thisismynewcourse');//id must be an object, store ID to decode from token
    user.tokens = user.tokens.concat({ token });//Add to array attached to user for more than one token for other devices
    await user.save();//save the token on the user in the token array
    return token;//send the tokens back
}
//Find User by email
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await UserCollection.findOne({email: email});//Declared at bottom of file, This was confusing
    if (!user) {//no user found
        throw new Error('Unable to login, user not found.')
    }
    const isMatched = await bcrypt.compare(password, user.password);//Check if passwords are matched
    if (!isMatched) {
        throw new Error('Unable to login, wrong password.')
    }
    return user;
}

//Function to be called before saving data to db, in this case hashing password before saving to DB collection
userSchema.pre('save', async function (next) {
    const user = this; //the document being saved to the db collection
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)//hash the password, 8 rounds
    }
    next()//provided by JS, has to be called or will hang
})

/**
 * This will create a collection in the db as (users), note - plural of the first
 * argument in the model method then export it so other files can use the UserModel Model for
 * CRUD functions
 */
const UserCollection = mongoose.model('user', userSchema);

module.exports = UserCollection;