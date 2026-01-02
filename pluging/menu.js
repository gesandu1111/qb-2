const { readEnv } = require("../lib/database");
const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "menu",
    alise: ["getmenu"],
    desc: "get cmd list",
    category: "main",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      const config = await readEnv();
      let menu = {
        main: "",
        download: "",
        group: "",
        owner: "",
        convert: "",
        search: "",
      };

      for (let i = 0; i < commands.length; i++) {
        if (commands[i].pattern && !commands[i].dontAddCommandList) {
          menu[
            commands[i].category
          ] += `${config.PREFIX}${commands[i].pattern}\n`;
        }
      }

      let madeMenu = `
╭───────────────╮

│ 🦅 *GESA MD BOT* 🦅

╰───────────────╯

👋 *Hello, ${pushname}*



╭───┈ *MAIN MENU* ┈───╮

│ ▫️ .alive

│ ▫️ .menu

│ ▫️ .ai <text>

│ ▫️ .system

│ ▫️ .owner

╰─────────────────╯



╭──┈ *DOWNLOADS* ┈───╮

│ ▫️ .song <text>

│ ▫️ .video <text>

│ ▫️ .fb <link>

╰─────────────────╯



╭───┈ *GROUP* ┈───╮

${menu.group}

╰─────────────────╯



╭───┈ *OWNER* ┈───╮

│ ▫️ .restart

│ ▫️ .update

╰─────────────────╯



╭──┈ *CONVERT* ┈───╮

│ ▫️ .sticker <reply>

│ ▫️ .img <reply>

│ ▫️ .tr <lang> <text>

│ ▫️ .tts <text>

╰─────────────────╯



╭───┈ *SEARCH* ┈───╮

${menu.search}

╰─────────────────╯



> 🥶 𝐌𝐚𝐝𝐞 𝐛𝐲 𝐌.𝐑.𝐠𝐞𝐬𝐚 🥶
`;
      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/gesandu1111/2026-2/blob/main/WhatsApp%20Image%202025-12-31%20at%2010.33.02.jpeg?raw=true",
          },
          caption: madeMenu,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.log(e);
      reply(`${e}`);
    }
  }
);
