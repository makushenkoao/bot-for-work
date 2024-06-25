const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskId: String,
    name: String,
    time: String,
    client: String,
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
