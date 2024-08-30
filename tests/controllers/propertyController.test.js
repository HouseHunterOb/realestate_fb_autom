const { expect } = require('chai');
const sinon = require('sinon');
const easybrokerService = require('../../src/services/easybrokerService');
const facebookService = require('../../src/services/facebookService');
const { publishProperties } = require('../../src/controllers/propertyController');

describe('propertyController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        propertyIds: ['valid_id']
      }
    };

    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    };

    sinon.stub(easybrokerService, 'getPropertyDetails');
    sinon.stub(easybrokerService, 'checkMetaTag');
    sinon.stub(easybrokerService, 'addMetaTag');
    sinon.stub(facebookService, 'publishProperty');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a message if the property already has Meta tag', async () => {
    easybrokerService.getPropertyDetails.resolves({ id: 'valid_id', tags: ['Meta'] });
    easybrokerService.checkMetaTag.resolves(true);

    await publishProperties(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.send.calledWith('La propiedad con ID valid_id ya fue publicada en Facebook en la página House Hunter Obispado.')).to.be.true;
  });

  it('should add Meta tag and publish the property if Meta tag is missing', async () => {
    easybrokerService.getPropertyDetails.resolves({ id: 'valid_id', tags: [] });
    easybrokerService.checkMetaTag.resolves(false);
    facebookService.publishProperty.resolves();

    await publishProperties(req, res);

    expect(easybrokerService.addMetaTag.calledWith('valid_id')).to.be.true;
    expect(facebookService.publishProperty.called).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.send.calledWith('La propiedad con ID valid_id no tenía la etiqueta "Meta". Se ha agregado la etiqueta y la propiedad se ha publicado en Facebook.')).to.be.true;
  });

  it('should handle errors and send an appropriate response', async () => {
    easybrokerService.getPropertyDetails.rejects(new Error('Failed to fetch property details'));

    await publishProperties(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.send.calledWith({ error: 'Failed to fetch property details' })).to.be.true;
  });
});
