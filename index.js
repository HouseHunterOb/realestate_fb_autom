require('dotenv').config();
const express = require('express');
const readline = require('readline');
const { publishProperties } = require('./src/controllers/publishController');


const app = express();
app.use(express.json());

const config = require('./src/config');


if (!config.easybrokerApiKey || !config.facebookPageAccessToken || !config.facebookPageId) {
    console.error('Error: Las variables de entorno no están configuradas correctamente.');
    process.exit(1); // Finaliza el proceso si las variables de entorno son undefined
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Ingrese los IDs de las propiedades que desea publicar, separados por comas: ', async (answer) => {
    const propertyIds = answer.split(',').map(id => id.trim());

    try {
        await publishProperties(propertyIds);
    } catch (error) {
        console.error('Error durante la publicación de la propiedad:', error.message);
    } finally {
        rl.close();
        process.exit(0); // Finaliza el proceso al completar la publicación o un error
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        console.error(`Error al iniciar el servidor: ${error.message}`);
        process.exit(1); // Finaliza el proceso si ocurre un error al iniciar el servidor
    }
});
