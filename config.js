const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "8IlEUSKK#oUIn36mRbSxbX7kNBUIuw4PkYixNoLK1lMDPcz0omW8",
  MONGODB: process.env.MONGODB || "mongodb://mongo:xUAyTAIxyzpPZhrowiekKaBHkjSCMjEw@turntable.proxy.rlwy.net:57791",
  OWNER_NUM: process.env.OWNER_NUM || "94753362282",
};
