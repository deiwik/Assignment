const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// status = 0 --> means pending
// status = 1 --> means accepted
// status = 2 --> means rejected

const assignedTaskSchema = Schema({
    unique_id: Number,
    assigned_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    },
    status: {
        type: Number
    }
})

AssignedTask = mongoose.model('AssignedTask',assignedTaskSchema);
module.exports = AssignedTask