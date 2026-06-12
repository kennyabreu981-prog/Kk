const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

// 📌 CANAL DE LOGS
const LOG_CHANNEL_ID = "1514778887224033513";

// servidor (Render)
const app = express();
app.get("/", (req, res) => res.send("Bot online!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor ativo");
});

// bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// COMANDOS
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (message.content === "!oi") {
    return message.reply("👋 Fala! Estou online!");
  }

  if (message.content === "!ping") {
    return message.reply("🏓 Pong!");
  }

  if (message.content === "!ajuda") {
    return message.reply("📌 Comandos: !oi, !ping, !verificar");
  }

  // VERIFICAÇÃO
  if (message.content === "!verificar") {
    const role = message.guild.roles.cache.find(r => r.name === "Verificado");

    if (!role) {
      return message.reply("❌ Cargo 'Verificado' não existe!");
    }

    await message.member.roles.add(role);

    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) {
      logChannel.send(
        `✅ VERIFICAÇÃO\n👤 ${message.author.tag}\n🎭 Cargo: Verificado`
      );
    }

    return message.reply("✅ Você foi verificado!");
  }
});

// 📥 ENTRADA
client.on("guildMemberAdd", member => {
  const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  logChannel.send(
    `📥 ENTRADA\n👤 Usuário: ${member.user.tag}\n🆔 ID: ${member.user.id}`
  );
});

// 🔨 BAN
client.on("guildBanAdd", ban => {
  const logChannel = ban.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  logChannel.send(
    `🔨 BANIMENTO\n👤 Usuário: ${ban.user.tag}\n🆔 ID: ${ban.user.id}`
  );
});

// 👢 KICK
client.on("guildMemberRemove", async member => {
  const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  try {
    const logs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 20
    });

    const entry = logs.entries.first();

    if (entry && entry.target.id === member.id) {
      logChannel.send(
        `👢 KICK\n👤 Usuário: ${member.user.tag}\n👮 Staff: ${entry.executor.tag}`
      );
    }
  } catch (err) {
    console.log("Erro kick log:", err);
  }
});

// 🗑️ DELETE MESSAGE
client.on("messageDelete", message => {
  if (!message.guild) return;

  const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  logChannel.send(
    `🗑️ MENSAGEM APAGADA\n👤 Autor: ${message.author?.tag || "Desconhecido"}\n💬 Conteúdo: ${message.content || "Sem conteúdo"}`
  );
});

// LOGIN
client.login(process.env.TOKEN);
