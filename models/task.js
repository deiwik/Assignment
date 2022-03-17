const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// status = 0 --> means pending
// status = 1 --> means accepted
// status = 2 --> means rejected

const taskSchema = Schema({
    unique_id: Number,
    creater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title:{
        type:String
    },
    description: {
        type: String
    }
})

Task = mongoose.model('Task',taskSchema);
module.exports = Task