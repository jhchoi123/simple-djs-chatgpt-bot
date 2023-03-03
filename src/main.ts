import { config as dotenv } from "dotenv";
import {
    Client, Events, IntentsBitField, Message, REST, TextChannel
} from "discord.js";
import { createClient, createConfig, requestChat } from "./api.js";

dotenv();

const apiConfig = createConfig({
    apiKey: process.env.OPENAI_API_KEY
});

const apiClient = createClient(apiConfig);

const botClient = new Client({
    intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.Guilds
    ]
});

let botId = "";

const botREST = new REST({ version: "10" });

// When Bot Login, Registering Commands
botClient.once(Events.ClientReady, async (client) => {
    console.log(`Bot Logged in As ${client.user.tag}`);
    botId = client.user.id;
});

// Message Listeners Here
botClient.on(Events.MessageCreate, async (message: Message) => {
    try {
        // Filter Messages
        if (message.author.bot) return;
        if (!message.content.startsWith(`<@${botId}>`)) return;

        // Remove Self Mention
        let str = message.content.replace(`<@${botId}>`, "");

        // Replace Mention to Username String
        message.mentions.users.map((user) => {
            str = str.replaceAll(`<@${user.id}>`, user.username);
        });

        await (message.channel as TextChannel).sendTyping();

        const res = await requestChat(apiClient, str, Number(message.author.id).toString(16));

        const result = res.choices[0].message?.content;

        if (!result || result == "") {
            await message.reply({
                content: "Failed to Generate Answer."
            });
        } else {
            await message.reply({
                content: result
            });
        }
    } catch (e) {
        console.error(e);
    }
});

await botClient.login(process.env.DISCORD_BOT_KEY);
