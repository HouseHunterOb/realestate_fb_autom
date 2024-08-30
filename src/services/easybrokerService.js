const axios = require('axios');

// Función para obtener los detalles de una propiedad desde EasyBroker
const fetchPropertyFromEasyBroker = async (propertyId) => {
    try {
        const response = await axios.get(`https://api.easybroker.com/v1/properties/${propertyId}`, {
            headers: {
                'X-Authorization': process.env.EASYBROKER_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener los detalles de la propiedad con ID ${propertyId}:`, error.message);
        throw new Error('Failed to fetch property details.');
    }
};

// Función para agregar la etiqueta "Meta" a una propiedad
const addMetaTagToProperty = async (propertyId) => {
    try {
        await axios.put(`https://api.easybroker.com/v1/properties/${propertyId}`, {
            tags: ['Meta']
        }, {
            headers: {
                'X-Authorization': process.env.EASYBROKER_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Etiqueta "Meta" agregada a la propiedad con ID ${propertyId}`);
    } catch (error) {
        console.error(`Error al agregar la etiqueta Meta a la propiedad con ID ${propertyId}:`, error.message);
        throw new Error('Failed to add Meta tag to property.');
    }
};

module.exports = {
    fetchPropertyFromEasyBroker,
    addMetaTagToProperty
};
