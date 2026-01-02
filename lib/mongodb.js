const mongoose = require('mongoose');
const config = require('../config');
const EnvVar = require('./mongodbenv');

const defaultEnvVariables = [
    { key: 'ALIVE_IMG', value: 'https://github.com/gesandu1111/2026-2/blob/main/WhatsApp%20Image%202025-12-31%20at%2010.33.02.jpeg?raw=true' },
    { key: 'ALIVE_MSG', value: 'Hello , I am alive now!!\n\n🥶 𝐌𝐚𝐝𝐞 𝐛𝐲 𝐌.𝐑.𝐠𝐞𝐬𝐚 🥶 },
    { key: 'PREFIX', value: '.' },
];

// MongoDB connection function
const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB);
        console.log('🛜 MongoDB Connected ✅');

        // Check and create default environment variables
        for (const envVar of defaultEnvVariables) {
            const existingVar = await EnvVar.findOne({ key: envVar.key });

            if (!existingVar) {
                // Create new environment variable with default value
                await EnvVar.create(envVar);
                console.log(`➕ Created default env var: ${envVar.key}`);
            }
        }

    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
