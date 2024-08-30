const axios = require('axios');
const { easybrokerApiKey } = require('../config');

const fetchPropertyFromEasyBroker = async (propertyId) => {
    try {
        const response = await axios.get(`https://api.easybroker.com/v1/properties/${propertyId}`, {
            headers: {
                'X-Authorization': easybrokerApiKey,
            },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.error('Error de autenticación: Verifica tu clave API de EasyBroker.');
        } else if (error.response && error.response.status === 404) {
            console.error(`Propiedad con ID ${propertyId} no encontrada.`);
        } else if (error.response && error.response.status >= 500) {
            console.error('Error en el servidor de EasyBroker. Inténtalo más tarde.');
        } else {
            console.error(`Error fetching property details: ${error.message}`);
        }
        throw new Error('Failed to fetch property details.');
    }
};

module.exports = { fetchPropertyFromEasyBroker };
