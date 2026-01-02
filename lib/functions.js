const { proto, downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");

// download media from message
const downloadMediaMessage = async (m, filename) => {
  if (m.type === "viewOnceMessage") m.type = m.msg.type;

  let name, stream, buffer;
  buffer = Buffer.from([]);

  switch (m.type) {
    case "imageMessage":
      name = filename ? filename + ".jpg" : "undefined.jpg";
      stream = await downloadContentFromMessage(m.msg, "image");
      break;
    case "videoMessage":
      name = filename ? filename + ".mp4" : "undefined.mp4";
      stream = await downloadContentFromMessage(m.msg, "video");
      break;
    case "audioMessage":
      name = filename ? filename + ".mp3" : "undefined.mp3";
      stream = await downloadContentFromMessage(m.msg, "audio");
      break;
    case "stickerMessage":
      name = filename ? filename + ".webp" : "undefined.webp";
      stream = await downloadContentFromMessage(m.msg, "sticker");
      break;
    case "documentMessage":
      const ext = m.msg.fileName.split(".")[1] || "bin";
      name = filename ? filename + "." + ext : "undefined." + ext;
      stream = await downloadContentFromMessage(m.msg, "document");
      break;
    default:
      return null;
  }

  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  fs.writeFileSync(name, buffer);
  return fs.readFileSync(name);
};

// sms function to normalize messages
const sms = (robin, m) => {
  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = m.fromMe ? robin.user.id.split(":")[0] + "@s.whatsapp.net" : m.isGroup ? m.key.participant : m.key.remoteJid;
  }

  if (m.message) {
    m.type = getContentType(m.message);
    m.msg = m.type === "viewOnceMessage" ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type];
    if (m.msg) {
      const quotedMsg = m.msg.contextInfo?.quotedMessage || null;
      m.body =
        m.type === "conversation"
          ? m.msg
          : m.type === "extendedTextMessage"
          ? m.msg.text
          : m.type === "imageMessage" && m.msg.caption
          ? m.msg.caption
          : m.type === "videoMessage" && m.msg.caption
          ? m.msg.caption
          : "";
      m.quoted = quotedMsg;
    }
  }

  m.reply = (text) => robin.sendMessage(m.chat, { text }, { quoted: m });
  m.download = (filename) => downloadMediaMessage(m, filename);

  return m;
};

module.exports = { sms, downloadMediaMessage };
