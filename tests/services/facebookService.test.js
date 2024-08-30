const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const facebookService = require('../../src/services/facebookService');

describe('facebookService', () => {
  describe('publishProperty', () => {
    let axiosPostStub;

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should publish property to Facebook', async () => {
      const mockResponse = { id: '12345' };
      axiosPostStub.resolves({ data: mockResponse });

      const property = { title: 'Test Property', operations: [{ formatted_amount: '1000 USD' }], construction_size: 100, location: { name: 'Location' }, description: 'Description' };
      const response = await facebookService.publishProperty(property);
      expect(response).to.deep.equal(mockResponse);
    });

    it('should throw an error if publishing to Facebook fails', async () => {
      axiosPostStub.rejects(new Error('Failed to publish property'));

      try {
        const property = { title: 'Test Property' };
        await facebookService.publishProperty(property);
      } catch (error) {
        expect(error.message).to.equal('Failed to publish property to Facebook.');
      }
    });
  });

  describe('formatPropertyMessage', () => {
    it('should format property message correctly', () => {
      const property = {
        title: 'Test Property',
        operations: [{ formatted_amount: '1000 USD', type: 'rent' }],
        construction_size: 100,
        location: { name: 'Location' },
        description: 'Description',
        public_url: 'http://example.com'
      };

      const message = facebookService.formatPropertyMessage(property);
      expect(message).to.contain('🏠 Test Property');
      expect(message).to.contain('💰 Precio: 1000 USD');
      expect(message).to.contain('📐 Metros de Construcción: 100 m²');
      expect(message).to.contain('📍 Ubicación: Location');
      expect(message).to.contain('📄 Descripción:');
      expect(message).to.contain('🔗 Más información: http://example.com');
    });
  });
});
