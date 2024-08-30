const axios = require('axios');
const { fetchPropertyFromEasyBroker } = require('../services/easybrokerService');
const { publishToFacebook } = require('../services/facebookService');

const getPropertyTypeEmoji = (type) => {
    switch (type.toLowerCase()) {
        case 'casa':
            return { emoji: '🏡', text: 'Casa' };
        case 'departamento':
            return { emoji: '🏢', text: 'Departamento' };
        case 'terreno':
            return { emoji: '🌳', text: 'Terreno' };
        case 'local comercial':
            return { emoji: '🏬', text: 'Local Comercial' };
        case 'bodega':
            return { emoji: '🏭', text: 'Bodega' };
        default:
            return { emoji: '🏠', text: type };
    }
};

const formatPropertyMessage = (property) => {
    let message = '';

    const propertyType = getPropertyTypeEmoji(property.property_type);
    const operationType = property.operations && property.operations[0] && property.operations[0].type === 'rental' ? 'En Renta' : 'En Venta';

    if (property.title) {
        message += `${propertyType.emoji} ${property.title}\n\n`;
    }

    message += `💼 ${operationType} | 💰 ${property.operations[0].formatted_amount}\n\n`;

    if (property.description) {
        const firstParagraph = property.description.split('\n')[0];
        message += `📄 ${firstParagraph}\n\n`;
    }

    if (property.bedrooms !== null || property.bathrooms !== null || property.parking_spaces !== null) {
        message += `${property.bedrooms} Habitaciones | ${property.bathrooms} Baños | ${property.parking_spaces} Estacionamientos\n\n`;
    }

    if (property.location && property.location.name) {
        message += `📍 Ubicación: ${property.location.name}\n\n`;
    }

    message += "✨ Somos una agencia especializada en la venta y renta de viviendas. Contáctanos para más opciones y un servicio personalizado.";

    return message;
};

const publishProperties = async (propertyIds) => {
    for (const propertyId of propertyIds) {
        try {
            const property = await fetchPropertyFromEasyBroker(propertyId);

            const images = property.property_images ? property.property_images.map(img => img.url) : [];
            const formattedMessage = formatPropertyMessage(property);

            await publishToFacebook(formattedMessage, images);

        } catch (error) {
            console.error(`Error al procesar la propiedad con ID ${propertyId}: ${error.message}`);
        }
    }
    console.log('Proceso de publicación completado.');
};

const publishToFacebookPost = async (message, imageUrls) => {
    try {
        const facebookApiUrl = `https://graph.facebook.com/v12.0/${process.env.FACEBOOK_PAGE_ID}/photos`;

        for (const imageUrl of imageUrls) {
            try {
                const response = await axios.post(facebookApiUrl, {
                    url: imageUrl,
                    caption: message,
                    access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
                });
                console.log('Imagen subida correctamente:', response.data);
            } catch (error) {
                console.error(`Error al subir la imagen ${imageUrl}:`, error.response ? error.response.data : error.message);
            }
        }

    } catch (error) {
        console.error('Error publishing property to Facebook:', error.response ? error.response.data : error.message);
        throw new Error('Failed to publish property to Facebook.');
    }
};

module.exports = { publishProperties };
