require("dotenv").config();
const { default: axios } = require("axios");
const Discord = require("discord.js");
const bot = new Discord.Client();
const TRANSLATION_ENDPOINT = "/v3/translate?version=2018-05-01";
const IDENTIFY_ENDPOINT = "/v3/identify?version=2018-05-01";

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", async (message) => {
  if (!message.author.bot) {
    if (await isFinnish(message.content)) {
      try {
        const channel = bot.channels.cache.find(
          (c) => c.name === message.channel.name
        );
        const translation = await translate(message.content);
        channel.send('>>> ' + message.content);
        channel.send("Translation: " + translation);
      } catch (err) {
        console.log(err);
      }
    }
  }
});

const translate = async message => {
  try {
    const res = await axios.post(
      process.env.TRANSLATE_URL + TRANSLATION_ENDPOINT,
      {
        text: [message],
        model_id: "fi-en",
      },
      {
        auth: {
          username: "apikey",
          password: process.env.TRANSLATE_API_KEY,
        },
      }
    );
    return Promise.resolve(res.data.translations[0].translation);
  } catch (err) {
    console.error(err.message);
    return Promise.resolve('Could not translate :(')
  }
}

const isFinnish = async (message) => {
  try {
    const res = await axios.post(
      process.env.TRANSLATE_URL + IDENTIFY_ENDPOINT,
      message,
      {
        auth: {
          username: "apikey",
          password: process.env.TRANSLATE_API_KEY,
        },
        headers: { "Content-type": "text/plain" },
      }
    );
    if (
      res.data.languages[0].language === "fi" &&
      res.data.languages[0].confidence > 0.8
    ) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  } catch (err) {
    console.log(err);
    return Promise.resolve(false);
  }
};
