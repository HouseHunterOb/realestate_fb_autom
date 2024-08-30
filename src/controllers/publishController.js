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
            const property = await fetchPropertyFromEasyBroker(propertyId);

            const images = property.photos ? property.photos.map(img => img.url) : [];

            const formattedMessage = formatPropertyMessage(property);
            await publishToFacebook(formattedMessage, images);

        } catch (error) {
            console.error(`Error al procesar la propiedad con ID ${propertyId}: ${error.message}`);
        }
    }
    console.log('Proceso de publicación completado.');
};

module.exports = { publishProperties };
