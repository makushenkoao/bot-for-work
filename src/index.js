const { Telegraf, Scenes, session, Markup } = require("telegraf");
const mongoose = require("mongoose");
const cron = require("node-cron");

const reportWizard = require("./scenes/reportWizard");
const sendMessage = require("./utils/sendMessage");
const Task = require("./models/task");
const taskCreationWizard = require("./scenes/taskCreationsWizard");
const db = require("./databases/main.json");

require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;
const BOT_TOKEN_DEV = process.env.BOT_TOKEN_DEV;
const TIMEZONE = process.env.TIMEZONE;

const bot = new Telegraf(BOT_TOKEN_DEV);

// Middlewares

bot.use(session());
const stage = new Scenes.Stage([reportWizard, taskCreationWizard]);
bot.use(stage.middleware());

// Start Command

bot.command("start", (ctx) => {
  ctx.reply("Hi Anton!\nI'll help you automate your workflows");
});

// Report Command

bot.command("report", async (ctx) => {
  try {
    await ctx.scene.enter("report-wizard");
  } catch (err) {
    console.error("Error in report scene:", err);
    ctx.reply("Report Creation Error:", err.message);
  }
});

// Tasks Commands

bot.command("task_set", async (ctx) => {
  try {
    await ctx.scene.enter("task-wizard");
  } catch (err) {
    console.error("Error in report scene:", err);
    ctx.reply("Report Creation Error:", err.message);
  }
});

bot.command("tasks_get", async (ctx) => {
  try {
    await mongoose.connect(MONGO_URL);

    const tasks = await Task.find();

    await mongoose.disconnect();

    if (tasks.length === 0) {
      return ctx.reply("Not found tasks");
    }

    let response = "Tasks:\n\n";

    tasks.forEach((task) => {
      const formattedCreatedAt = task.createdAt.toLocaleString("en-US", {
        timeZone: TIMEZONE,
        hour12: false,
      });

      response += `.${task.taskId}:\n- Name: ${task.name}\n- For: ${task.client}\n- Duration: ${task.time}h\n- Created At: ${formattedCreatedAt}\n\n`;
    });

    ctx.reply(response);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    ctx.reply("Error fetching tasks. Please try again later.");
  }
});

bot.command("task_delete", async (ctx) => {
  try {
    const taskId = ctx.message.text.split(" ")[1];

    if (!taskId) {
      return ctx.reply("Please provide a Task ID to delete.");
    }

    await mongoose.connect(MONGO_URL);

    const deletedTask = await Task.findOneAndDelete({ taskId });

    await mongoose.disconnect();

    if (!deletedTask) {
      return ctx.reply("Task not found.");
    }

    ctx.reply(`Task "${deletedTask.name}" deleted successfully.`);
  } catch (error) {
    console.error("Error deleting task:", error);
    ctx.reply("Failed to delete task. Please try again later.");
  }
});

// Calls Commands and Actions

bot.command("call_start", (ctx) => {
  const buttons = [
    { text: "Dylan", url: "https://meet.google.com/sgd-saje-yxk" },
    { text: "Consuelo", url: "https://meet.google.com/sgd-saje-yxk" },
  ];

  ctx.reply("Choose the call link:", {
    reply_markup: {
      inline_keyboard: [buttons],
    },
  });
});

bot.command("call_links", (ctx) => {
  ctx.reply("Choose the call link:", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Dylan", callback_data: "dylan-call-link" },
          { text: "Consuelo", callback_data: "consuelo-call-link" },
        ],
      ],
    },
  });
});

// Call Actions

bot.action("dylan-call-link", (ctx) => {
  ctx.deleteMessage();
  ctx.reply("https://meet.google.com/sgd-saje-yxk");
});

bot.action("consuelo-call-link", (ctx) => {
  ctx.deleteMessage();
  ctx.reply("the link doesn't exist.");
});

// Schedules

db.schedules.forEach((task) => {
  cron.schedule(
    task.schedule,
    () => {
      sendMessage(task.message, bot);
    },
    {
      timezone: TIMEZONE,
    }
  );
});

// Catch Global Error and Launch

bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  console.error(err);
});

bot.launch();
