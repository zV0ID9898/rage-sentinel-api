require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
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

app.get("/auth/discord/test", (req, res) => {
  res.send("OAuth funcionando");
});

app.get("/auth/discord", (req, res) => {

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify"
  });

  res.redirect(
    `https://discord.com/oauth2/authorize?${params}`
  );

});
app.get("/auth/discord/callback", async (req, res) => {

  try {

    const code = req.query.code;

    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      }),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        }
      }
    );

    const accessToken =
      tokenRes.data.access_token;

    const userRes = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const user = userRes.data;

    const FRONTEND_URL =
  "https://TU-FRONTEND.com";

res.redirect(
  `http://localhost:3000/?discordId=${user.id}`
);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "OAuth error"
    });

  }

});
client.once("ready", () => {
  console.log(`BOT ONLINE: ${client.user.tag}`);
});

console.log(
  "TOKEN:",
  process.env.DISCORD_BOT_TOKEN ? "SI EXISTE" : "NO EXISTE"
);

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