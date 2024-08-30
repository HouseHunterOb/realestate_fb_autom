require('dotenv').config();
const axios = require('axios');
const fs = require('fs');


let config = {
    facebookPageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
};

const renewFacebookToken = async () => {
    try {
        const response = await axios.get('https://graph.facebook.com/v16.0/oauth/access_token', {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                fb_exchange_token: config.facebookPageAccessToken,
            }
        });

        const newAccessToken = response.data.access_token;

        console.log('Nuevo token de acceso:', newAccessToken);

        // Actualiza el archivo .env con el nuevo token de acceso
        fs.writeFileSync('.env', `FACEBOOK_PAGE_ACCESS_TOKEN=${newAccessToken}\n`, { flag: 'w' });

        console.log('El token de acceso ha sido actualizado en el archivo .env');

        // Actualizar el token en la configuración en memoria
        config.facebookPageAccessToken = newAccessToken;

        // Reconfigurar dotenv para actualizar el entorno de la aplicación
        process.env.FACEBOOK_PAGE_ACCESS_TOKEN = newAccessToken;

    } catch (error) {
        console.error('Error al renovar el token de acceso:', error.response ? error.response.data : error.message);
    }
};

module.exports = {
    renewFacebookToken,
    config // Exportamos config para ser usado en otras partes del programa
};
