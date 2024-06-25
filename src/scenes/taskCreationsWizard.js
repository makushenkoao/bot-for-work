const { Scenes } = require("telegraf");
const mongoose = require("mongoose");
const Task = require("../models/task");
require("dotenv").config();

const taskCreationWizard = new Scenes.WizardScene(
  "task-wizard",
  async (ctx) => {
    await ctx.reply("Task Creation.\n\nClient Name:");
    ctx.wizard.state.task = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.task.clientName = ctx.message.text;
    await ctx.reply("Task:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.task.task = ctx.message.text;
    await ctx.reply("Time:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.task.time = ctx.message.text;
    await ctx.reply("Task ID:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.task.taskId = ctx.message.text;

    try {
      await mongoose.connect(process.env.MONGO_URL);

      // Create a new Task instance
      const newTask = new Task({
        taskId: ctx.wizard.state.task.taskId,
        name: ctx.wizard.state.task.task,
        time: ctx.wizard.state.task.time,
        client: ctx.wizard.state.task.clientName,
      });

      await newTask.save();

      await mongoose.disconnect();

      await ctx.reply("Task created successfully!");
      return ctx.scene.leave();
    } catch (error) {
      console.error("Error creating task:", error);
      await ctx.reply("Failed to create task. Please try again later.");
      return ctx.scene.leave();
    }
  }
);

module.exports = taskCreationWizard;
