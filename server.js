

const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`BOT ONLINE: ${client.user.tag}`);
});
console.log("TOKEN:", process.env.DISCORD_BOT_TOKEN ? "SI EXISTE" : "NO EXISTE");
console.log("RAGE_SERVER_ID:", process.env.RAGE_SERVER_ID);
console.log("TOKEN:", process.env.DISCORD_BOT_TOKEN);
console.log("TOKEN EXISTE:", !!process.env.DISCORD_BOT_TOKEN);

client.login(process.env.DISCORD_BOT_TOKEN);

app.get("/validate/:userid", async (req, res) => {

  try {

    const userId = req.params.userid;
    if (!/^\d{17,20}$/.test(userId)) {
  return res.status(400).json({
    error: "Discord ID inválido"
  });
}

    const rageGuild = await client.guilds.fetch(
      process.env.RAGE_SERVER_ID
    );

    const sentinelGuild = await client.guilds.fetch(
      process.env.SENTINEL_SERVER_ID
    );

    let premium = false;
    let source = null;

    try {

      const member = await rageGuild.members.fetch(
        userId
      );

      if (
        member.roles.cache.has(
          process.env.RAGE_ROLE_ID
        )
      ) {
        premium = true;
        source = "rage";
      }

    } catch {}

    try {

      const member = await sentinelGuild.members.fetch(
        userId
      );

      if (
        member.roles.cache.has(
          process.env.SENTINEL_ROLE_ID
        )
      ) {
        premium = true;
        source = "sentinel";
      }

    } catch {}

    return res.json({
      premium,
      source
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }

});

app.listen(process.env.PORT || 3001, () => {
  console.log(
    `API ONLINE EN PUERTO ${process.env.PORT || 3001}`
  );
});