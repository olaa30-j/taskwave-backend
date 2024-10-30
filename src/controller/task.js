import Task from "../models/task.js"; 
import UserModel from "../models/user.js"

// ///////////////////////////////////////////////////////////////////////////////////////// //
// Create a new task
export const createTask = async (req, res) => {
    const userId = req.user.userId
    const { title, description, priority } = req.body;

    if (!title || !description || !priority ) {
        return res.status(400).send({ message: "All fields are required." });
    }

    try {
        let imageFile;
        if (req.file) {
            imageFile = req.file.path.replace(/\\/g, '/'); 
        }

        const newTask = new Task({ image: imageFile, title, description, priority, user: userId });
        await newTask.save();
        return res.status(201).json({ message: "Task created successfully.", task: newTask });
    } catch (error) {
        console.error("Error creating task:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////// //
// Get all tasks
export const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate("user", ['userImage', 'username', '-_id']); 
        return res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////// //
// Get user Tasks 
export const getUserTasks = async (req, res) => {
    const  userId = req.user.userId;
    try {
        const tasks = await Task.find({ user: userId }).populate("user", ['userImage', 'username', '-_id']); 

        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found for this user." });
        }

        return res.status(200).json(tasks);
    } catch (err) {
        console.error("Error fetching user tasks:", err.message);
        return res.status(500).json({ message: "Server failed in fetching user tasks." });
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////// //
// Get task by ID
export const getTaskById = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id).populate("user", "username");
        if (!task) {
            return res.status(404).send({ message: "Task not found." });
        }
        return res.status(200).json(task);
    } catch (error) {
        console.error("Error fetching task:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////// //
// Update a task
export const updateTask = async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    const updates = req.body;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }
        if (req.file) {
            updates.image = req.file.path.replace(/\\/g, '/');
        }   

        if (userId === task.user.toString()) { 
            const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
            if (!updatedTask) {
                return res.status(400).json({ message: "Failed to update the task." });
            }

            return res.status(200).json({ message: "Task updated successfully.", task: updatedTask });
        } else {
            return res.status(403).json({ message: "User does not have access to update this task." });
        }
    } catch (error) {
        console.error("Error updating task:", error); 
        return res.status(500).json({ message: "Server error.", error: error.message }); 
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////// //
// Update state of task by any user 
export const updateTaskState = async (req, res) => {
    const { id } = req.params;
    const {state} = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).send({ message: "Task not found." });
        }

        task.state = state;
        const updatedTask = await task.save()

        return res.status(200).json({ message: "Task updated successfully.", task: updatedTask });
    } catch (error) {
        console.error("Error updating task:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////// //
// Delete a task
export const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).send({ message: "Task not found." });
        }
        return res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
        console.error("Error deleting task:", error.message);
        return res.status(500).send({ message: "Server error." });
    }
};
