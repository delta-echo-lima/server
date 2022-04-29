const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
})
/**
 * This will create a collection in the db as (tasks), note - plural of the first
 * argument in the model method then export it so other files can use the TaskModel Model
 * for CRUD functions
 */
const TaskModel = mongoose.model('task', taskSchema);

module.exports = TaskModel;