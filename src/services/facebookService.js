const axios = require('axios');
const { facebookPageAccessToken, facebookPageId } = require('../config');

const publishToFacebook = async (message, images) => {
    try {
        const mediaFbIds = [];

        // Publicar las imágenes en Facebook
        for (const image of images) {
            try {
                const photoResponse = await axios.post(`https://graph.facebook.com/v12.0/${facebookPageId}/photos`, {
                    url: image,
                    access_token: facebookPageAccessToken,
                    published: false
                });
                mediaFbIds.push({ media_fbid: photoResponse.data.id });
            } catch (error) {
                console.error(`Error al subir la imagen ${image}: ${error.message}`);
                continue; // Continuar con la siguiente imagen si falla una
            }
        }

        // Publicar el mensaje junto con las imágenes
        await axios.post(`https://graph.facebook.com/v12.0/${facebookPageId}/feed`, {
            message: message,
            attached_media: mediaFbIds,
            access_token: facebookPageAccessToken,
            privacy: {
                value: "EVERYONE"  // Esto asegura que la publicación sea pública
            }
        });

        console.log('Property published successfully on Facebook');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.error('Error de autenticación: Verifica tu token de acceso de Facebook.');
        } else if (error.response && error.response.status >= 500) {
            console.error('Error en el servidor de Facebook. Inténtalo más tarde.');
        } else {
            console.error(`Error publishing property to Facebook: ${error.message}`);
        }
        throw new Error('Failed to publish property to Facebook.');
    }
};

module.exports = { publishToFacebook };
