const axios = require('axios');

const facebookService = {
  async publishProperty(property) {
    try {
      const pageId = process.env.FACEBOOK_PAGE_ID;
      const message = this.formatPropertyMessage(property);

      const response = await axios.post(`https://graph.facebook.com/v12.0/${pageId}/feed`, {
        message: message,
        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      });

      return response.data;
    } catch (error) {
      console.error(`Error publishing property to Facebook: ${error.message}`);
      throw new Error('Failed to publish property to Facebook.');
    }
  },

  formatPropertyMessage(property) {
    let message = `🏠 ${property.title}\n\n`;

    if (property.operations && property.operations[0]) {
      message += property.operations[0].type === 'rent' ? '🏡 En Renta\n\n' : '🏡 En Venta\n\n';
    }

    message += `💰 Precio: ${property.operations[0].formatted_amount}\n\n`;
    message += `📐 Metros de Construcción: ${property.construction_size} m²\n\n`;
    message += `📍 Ubicación: ${property.location.name}\n\n`;
    message += `📄 Descripción:\n${property.description}\n\n`;
    message += `🔗 Más información: ${property.public_url}`;

    return message;
  },
};

module.exports = facebookService;
