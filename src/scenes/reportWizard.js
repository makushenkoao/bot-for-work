const { Scenes } = require("telegraf");

const reportWizard = new Scenes.WizardScene(
  "report-wizard",
  (ctx) => {
    ctx.reply("Report creation.\n\nClient name:");
    ctx.wizard.state.report = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.report.clientName = ctx.message.text;
    await ctx.reply("Started work at:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.report.startTime = ctx.message.text;
    await ctx.reply("Finished work at:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.report.endTime = ctx.message.text;
    ctx.wizard.state.report.tasks = [];
    await ctx.reply(
      'Now enter the task and time it. When you\'re done, enter "done."'
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const userInput = ctx.message.text.trim();

    if (userInput.toLowerCase() === "done") {
      const { report } = ctx.wizard.state;

      if (
        !report.clientName ||
        !report.startTime ||
        !report.endTime ||
        !report.tasks ||
        report.tasks.length === 0
      ) {
        await ctx.reply("Please enter all required data for the report.");
        return;
      }

      const totalHours = report.tasks.reduce((acc, task) => acc + task.time, 0);

      let report1 = `---Report for Command---\n\nПрацював з ${report.startTime} до ${report.endTime}\n\n`;
      report1 += `${report.clientName}:\n\n`;
      report.tasks.forEach((task) => {
        report1 += `- ${task.task} - ${task.time} годин\n`;
      });
      report1 += `\nЗатрекав ${totalHours} годин`;

      let report2 = `---Report for Client---\n\nHi ${report.clientName}!\n\nupdates:\n`;
      report.tasks.forEach((task) => {
        report2 += `- ${task.task}\n`;
      });
      report2 += `\nhave a nice evening!`;

      await ctx.reply(report1);
      await ctx.reply(report2);

      await ctx.scene.leave();
    } else {
      const [task, timeString] = userInput.split(" - ");
      const parsedTime = parseFloat(timeString);

      if (isNaN(parsedTime)) {
        await ctx.reply("Time Error");
        return;
      }

      ctx.wizard.state.report.tasks.push({ task, time: parsedTime });
      await ctx.reply(
        "Enter the next task and time or send the word 'done' to complete the entry:"
      );
    }
  }
);

module.exports = reportWizard;
