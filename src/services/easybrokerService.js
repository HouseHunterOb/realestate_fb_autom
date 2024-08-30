const axios = require('axios');

const easybrokerService = {
  async getPropertyDetails(propertyId) {
    if (!propertyId || typeof propertyId !== 'string') {
      throw new Error('Invalid property ID');
    }

    try {
      const response = await axios.get(`https://api.easybroker.com/v1/properties/${propertyId}`, {
        headers: {
          'X-Authorization': process.env.EASYBROKER_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching property details: ${error.message}`);
      throw new Error('Failed to fetch property details.');
    }
  },

  async addMetaTag(propertyId) {
    try {
      const response = await axios.post(`https://api.easybroker.com/v1/properties/${propertyId}/tags`, {
        tags: ['Meta']
      }, {
        headers: {
          'X-Authorization': process.env.EASYBROKER_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error adding Meta tag to property: ${error.message}`);
      throw new Error('Failed to add Meta tag.');
    }
  },

  async checkMetaTag(property) {
    return property.tags && property.tags.includes('Meta');
  }
};

module.exports = easybrokerService;
