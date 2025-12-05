const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

const MODMAIL_CATEGORY_ID = "1445770293846081789";

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  client.user.setPresence({
    status: "online", // online | idle | dnd | invisible
    activities: [
      {
        name: "Powered by RBLX HUB",
        type: 0 
      }
    ]
  });
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    message.reply("Pong! Bot is online 24/7 🚀");
  }

  if (message.guild && message.channel.parentId === MODMAIL_CATEGORY_ID) {
    const userId = message.channel.topic;
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return message.reply("❌ User not found.");

    return user.send(`📩 **Staff:** ${message.content}`);
  }

  if (message.channel.type === 1) { // DM
    const guild = client.guilds.cache.first();
    if (!guild) return;

    let existingChannel = guild.channels.cache.find(
      ch => ch.topic === message.author.id
    );

    if (!existingChannel) {
      existingChannel = await guild.channels.create({
        name: `ticket-${message.author.username}`,
        type: 0,
        parent: MODMAIL_CATEGORY_ID,
        topic: message.author.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: guild.members.me.id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });

      existingChannel.send(`📬 **New ModMail from <@${message.author.id}>**`);
    }

    existingChannel.send(`✉️ **User:** ${message.content}`);
    message.author.send("📨 Your message has been sent to staff.");
  }
});

client.login(process.env.TOKEN);
