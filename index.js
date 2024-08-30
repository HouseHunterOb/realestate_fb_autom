require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
const express = require('express');
const readline = require('readline');
const { renewFacebookToken, config } = require('./src/config/renewToken'); // Importar la funcionalidad de renovación del token
const { publishProperties } = require('./controllers/publishController'); // Importar la función para publicar propiedades

const app = express();
app.use(express.json());

console.log('Inicio del programa'); // Añadir este log al principio

(async () => {
    try {
        console.log('Renovando token...'); // Añadir log antes de renovar el token
        await renewFacebookToken();
        
        console.log('Token renovado:', config.facebookPageAccessToken); // Añadir log después de renovar el token

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Ingrese los IDs de las propiedades que desea publicar, separados por comas: ', async (answer) => {
            console.log('IDs ingresados:', answer); // Añadir log para ver qué IDs se ingresaron
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

    } catch (error) {
        console.error('Error en la renovación del token o durante la operación:', error.message);
        process.exit(1);
    }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        console.error(`Error al iniciar el servidor: ${error.message}`);
        process.exit(1); // Finaliza el proceso si ocurre un error al iniciar el servidor
    }
});
