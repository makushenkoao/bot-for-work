require("dotenv").config();

const CHAT_ID = process.env.CHAT_ID;

function sendMessage(message, bot, chatId) {
  bot.telegram.sendMessage(chatId ? chatId : CHAT_ID, message);
}

module.exports = sendMessage;
