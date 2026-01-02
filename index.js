const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");
const P = require("pino");
const axios = require("axios");

const config = require("./config");
const { getBuffer, getGroupAdmins, sms } = require("./lib/functions");

const ownerNumber = config.OWNER_NUM;

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//=================== SESSION AUTH ====================
if (!fs.existsSync(path.join(__dirname, "/auth_info_baileys/creds.json"))) {
  if (!config.SESSION_ID)
    console.log("⚠️ Please add your session to SESSION_ID env !!");
}

//=================== CONNECT TO WA ===================
async function connectToWA() {
  // MongoDB connection
  const connectDB = require("./lib/mongodb");
  connectDB();

  console.log("Connecting G_E_S_A...");

  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, "/auth_info_baileys/")
  );

  const { version } = await fetchLatestBaileysVersion();

  const robin = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
  });

  //================== CONNECTION EVENTS ==================
  robin.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      ) {
        console.log("Reconnecting...");
        connectToWA();
      } else {
        console.log("Logged out from WhatsApp!");
      }
    } else if (connection === "open") {
      console.log("✅ Connected to WhatsApp");

      //================ PLUGIN LOADER =================
      const pluginPath = path.join(__dirname, "plugins");
      if (fs.existsSync(pluginPath)) {
        fs.readdirSync(pluginPath).forEach((plugin) => {
          if (path.extname(plugin).toLowerCase() === ".js") {
            require(path.join(pluginPath, plugin));
          }
        });
        console.log("✅ G_E_S_A plugins loaded");
      } else {
        console.log(`⚠️ Plugins folder "${pluginPath}" not found. Skipping.`);
      }

      // Send welcome message to owner
      const upMsg = "G_E_S_A connected successfully ✅";
      const imgUrl =
        "https://github.com/gesandu1111/2026-2/blob/main/WhatsApp%20Image%202025-12-31%20at%2010.33.02.jpeg?raw=true";
      robin.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: { url: imgUrl },
        caption: upMsg,
      });
    }
  });

  robin.ev.on("creds.update", saveCreds);

  //================== MESSAGE EVENTS ==================
  robin.ev.on("messages.upsert", async (mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;

    mek.message =
      getContentType(mek.message) === "ephemeralMessage"
        ? mek.message.ephemeralMessage.message
        : mek.message;

    if (mek.key?.remoteJid === "status@broadcast") return;

    const m = sms(robin, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;

    const body =
      type === "conversation"
        ? mek.message.conversation
        : type === "extendedTextMessage"
        ? mek.message.extendedTextMessage.text
        : type === "imageMessage" && mek.message.imageMessage.caption
        ? mek.message.imageMessage.caption
        : type === "videoMessage" && mek.message.videoMessage.caption
        ? mek.message.videoMessage.caption
        : "";

    const isCmd = body.startsWith(config.PREFIX || ".");
    const command = isCmd
      ? body.slice((config.PREFIX || ".").length).trim().split(" ")[0].toLowerCase()
      : "";
    const args = body.trim().split(/ +/).slice(1);
    const sender = mek.key.fromMe
      ? robin.user.id.split(":")[0] + "@s.whatsapp.net"
      : mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split("@")[0];

    //================ COMMAND HANDLER =================
    const events = require("./command");
    if (isCmd) {
      const cmd =
        events.commands.find((cmd) => cmd.pattern === command) ||
        events.commands.find(
          (cmd) => cmd.alias && cmd.alias.includes(command)
        );
      if (cmd) {
        try {
          cmd.function(robin, mek, m, {
            from,
            body,
            command,
            args,
            sender,
            senderNumber,
          });
        } catch (e) {
          console.error("[PLUGIN ERROR] " + e);
        }
      }
    }
  });
}

//================ EXPRESS SERVER =================
app.get("/", (req, res) => {
  res.send("hey, M.R.Gesa started ✅");
});

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);

// Delay connect to WA to allow Express to start
setTimeout(() => {
  connectToWA();
}, 4000);
