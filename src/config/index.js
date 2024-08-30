require('dotenv').config();

const config = {
    easybrokerApiKey: process.env.EASYBROKER_API_KEY,
    facebookPageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    facebookPageId: process.env.FACEBOOK_PAGE_ID
};

if (!config.easybrokerApiKey || !config.facebookPageAccessToken || !config.facebookPageId) {
    throw new Error('Faltan una o más variables de entorno críticas.');
}

module.exports = config;
