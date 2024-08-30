const easybrokerService = require('../services/easybrokerService');
const facebookService = require('../services/facebookService');
const { handleError } = require('../utils/errorHandler');

const publishProperties = async (req, res) => {
  try {
    const propertyIds = req.body.propertyIds;

    for (let i = 0; i < propertyIds.length; i++) {
      const propertyId = propertyIds[i];
      const property = await easybrokerService.getPropertyDetails(propertyId);

      if (await easybrokerService.checkMetaTag(property)) {
        res.status(200).send(`La propiedad con ID ${propertyId} ya fue publicada en Facebook en la página House Hunter Obispado.`);
      } else {
        await easybrokerService.addMetaTag(propertyId);
        await facebookService.publishProperty(property);
        res.status(200).send(`La propiedad con ID ${propertyId} no tenía la etiqueta "Meta". Se ha agregado la etiqueta y la propiedad se ha publicado en Facebook.`);
      }
    }
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { publishProperties };
