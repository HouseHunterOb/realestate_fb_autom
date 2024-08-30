const { fetchPropertyFromEasyBroker } = require('../services/easybrokerService');
const { publishToFacebook } = require('../services/facebookService');

const formatPropertyMessage = (property) => {
    let message = '';

    if (property.title) {
        message += `🏠 *${property.title}*\n\n`;
    }
    if (property.operations && property.operations[0] && property.operations[0].formatted_amount) {
        message += `💰 Precio: ${property.operations[0].formatted_amount}\n\n`;
    }
    if (property.description) {
        message += `📄 Descripción:\n${property.description}\n\n`;
    }

    return message;
};

const publishProperties = async (propertyIds) => {
    for (const propertyId of propertyIds) {
        try {
            // Obtener los detalles de la propiedad desde EasyBroker
            const property = await fetchPropertyFromEasyBroker(propertyId);

            // Extraer las URLs de las fotos desde property_images
            const images = property.property_images ? property.property_images.map(img => img.url) : [];

            // Formatear el mensaje de la propiedad
            const formattedMessage = formatPropertyMessage(property);

            // Publicar en Facebook
            await publishToFacebook(formattedMessage, images);

        } catch (error) {
            console.error(`Error al procesar la propiedad con ID ${propertyId}: ${error.message}`);
        }
    }
    console.log('Proceso de publicación completado.');
};

module.exports = { publishProperties };
