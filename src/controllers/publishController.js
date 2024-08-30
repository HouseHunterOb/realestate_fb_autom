const axios = require('axios');
const { fetchPropertyFromEasyBroker, addMetaTagToProperty } = require('../services/easybrokerService');
const cliProgress = require('cli-progress');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para limpiar la consola antes de comenzar
const clearConsole = () => {
    process.stdout.write('\x1Bc');
};

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
    const formattedPrice = `${property.operations[0].formatted_amount} MXN`; // Agregar "MXN" después del precio

    if (property.title) {
        message += `${propertyType.emoji} ${property.title}\n\n`;
    }

    message += `💼 ${operationType} | 💰 ${formattedPrice}\n\n`;

    if (property.description) {
        const firstParagraph = property.description.split('\n')[0];
        message += `📄 ${firstParagraph}\n\n`;
    }

    const details = [];
    if (property.bedrooms !== null) details.push(`🛏️ ${property.bedrooms} Habitaciones`);
    if (property.bathrooms !== null) details.push(`🛁 ${property.bathrooms} Baños`);
    if (property.parking_spaces !== null) details.push(`🚗 ${property.parking_spaces} Estacionamientos`);

    if (details.length > 0) {
        message += details.join(' | ') + '\n\n';
    }

    if (property.location && property.location.name) {
        message += `📍 Ubicación: ${property.location.name}\n\n`;
    }

    message += "✨ Somos una agencia especializada en la venta y renta de viviendas. Contáctanos para más opciones y un servicio personalizado.\n\n";

    if (property.public_url) {
        message += `🔗 [Ver Propiedad](${property.public_url})`;
    }

    return message;
};

// Función para buscar propiedades sin la etiqueta "Meta" y publicarlas solo si el usuario lo confirma
const findAndPublishPropertiesWithoutMeta = async () => {
    try {
        const propertiesWithoutMeta = await findPropertiesWithoutMetaTag();
        if (propertiesWithoutMeta.length > 0) {
            console.log('Propiedades sin la etiqueta "Meta":', propertiesWithoutMeta.join(', '));
            rl.question('¿Desea publicar estas propiedades y agregar la etiqueta "Meta"? (sí/no): ', async (answer) => {
                if (answer.toLowerCase() === 'sí' || answer.toLowerCase() === 'si') {
                    await publishSpecificProperties(propertiesWithoutMeta);
                } else {
                    console.log('No se publicaron las propiedades.');
                }
                rl.close();
            });
        } else {
            console.log('Todas las propiedades ya tienen la etiqueta "Meta".');
            rl.close();
        }
    } catch (error) {
        console.error('Error al buscar propiedades sin la etiqueta Meta:', error.message);
        rl.close();
    }
};

const findPropertiesWithoutMetaTag = async () => {
    try {
        const response = await axios.get('https://api.easybroker.com/v1/properties', {
            headers: {
                'X-Authorization': process.env.EASYBROKER_API_KEY
            }
        });

        const propertiesWithoutMeta = response.data.content.filter(property => !property.tags.includes('Meta'));
        return propertiesWithoutMeta.map(property => property.public_id);
    } catch (error) {
        console.error('Error al buscar propiedades sin la etiqueta Meta:', error.message);
        throw new Error('Failed to fetch properties.');
    }
};

const publishSpecificProperties = async (propertyIds) => {
    clearConsole(); // Limpiar la consola antes de comenzar

    const totalProperties = propertyIds.length;
    const progressBar = new cliProgress.SingleBar({
        format: 'Publicando Propiedades [{bar}] {percentage}% | Propiedad: {value}/{total}'
    }, cliProgress.Presets.shades_classic);
    
    progressBar.start(totalProperties, 0);

    for (let i = 0; i < propertyIds.length; i++) {
        const propertyId = propertyIds[i];
        try {
            const property = await fetchPropertyFromEasyBroker(propertyId);
            const images = property.property_images ? property.property_images.map(img => img.url) : [];
            const formattedMessage = formatPropertyMessage(property);

            await publishToFacebook(formattedMessage, images);

            progressBar.update(i + 1); // Actualizar el progreso en tiempo real

        } catch (error) {
            console.error(`Error al procesar la propiedad con ID ${propertyId}: ${error.message}`);
        }
    }

    progressBar.stop();
    console.log('Proceso de publicación completado.\n'); // Agregar una línea en blanco al final
};

const publishToFacebook = async (message, imageUrls) => {
    const facebookApiUrl = `https://graph.facebook.com/v12.0/${process.env.FACEBOOK_PAGE_ID}/photos`;
    const mediaIds = [];
    const totalImages = imageUrls.length;

    const imageProgressBar = new cliProgress.SingleBar({
        format: 'Subiendo Imágenes [{bar}] {percentage}% | Imagen: {value}/{total}'
    }, cliProgress.Presets.shades_classic);

    imageProgressBar.start(totalImages, 0);

    // Subir imágenes primero y obtener sus IDs
    for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        try {
            const response = await axios.post(facebookApiUrl, {
                url: imageUrl,
                access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
                published: false // Subir la imagen sin publicarla de inmediato
            });
            mediaIds.push(response.data.id);

        } catch (error) {
            console.error(`Error al subir la imagen: ${error.message}`);
        }

        imageProgressBar.update(i + 1); // Actualizar el progreso de imágenes en tiempo real
    }

    imageProgressBar.stop();

    // Publicar todas las imágenes en una sola publicación
    try {
        const albumPostUrl = `https://graph.facebook.com/v12.0/${process.env.FACEBOOK_PAGE_ID}/feed`;
        await axios.post(albumPostUrl, {
            message: message,
            attached_media: mediaIds.map(id => ({ media_fbid: id })), // Adjuntar todas las imágenes a la publicación
            access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
        });

        console.log('Propiedad publicada correctamente en Facebook.');

    } catch (error) {
        console.error('Error publicando la propiedad en Facebook:', error.response ? error.response.data : error.message);
        throw new Error('Failed to publish property to Facebook.');
    }
};

// Función principal que integra todo
const mainMenu = async () => {
    await findAndPublishPropertiesWithoutMeta();
};

module.exports = { mainMenu };
