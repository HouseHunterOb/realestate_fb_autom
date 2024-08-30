require('dotenv').config();
const express = require('express');
const { mainMenu } = require('./src/controllers/publishController');

const app = express();
app.use(express.json());

const config = require('./src/config');

if (!config.easybrokerApiKey || !config.facebookPageAccessToken || !config.facebookPageId) {
    console.error('Error: Las variables de entorno no están configuradas correctamente.');
    process.exit(1); // Finaliza el proceso si las variables de entorno son undefined
}

// Inicia el menú principal para manejar las opciones
mainMenu();

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        console.error(`Error al iniciar el servidor: ${error.message}`);
        process.exit(1); // Finaliza el proceso si ocurre un error al iniciar el servidor
    }
});
