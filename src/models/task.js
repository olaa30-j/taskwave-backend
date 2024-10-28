import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    image: {
        type: String,  
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],  
        required: true
    },
    state: {
        type: String,
        enum: ['todo', 'doing', 'done'], 
        default: 'todo'  
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }
}, { timestamps: true }); 

const Task = mongoose.model("Task", taskSchema);

export default Task;
