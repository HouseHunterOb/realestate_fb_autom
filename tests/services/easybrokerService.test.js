const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const easybrokerService = require('../../src/services/easybrokerService');

describe('easybrokerService', () => {
  describe('getPropertyDetails', () => {
    let axiosGetStub;

    beforeEach(() => {
      axiosGetStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return property details for a valid propertyId', async () => {
      const mockData = { id: 'valid_id', title: 'Mock Property' };
      axiosGetStub.resolves({ data: mockData });

      const propertyDetails = await easybrokerService.getPropertyDetails('valid_id');
      expect(propertyDetails).to.deep.equal(mockData);
    });

    it('should throw an error for an invalid propertyId', async () => {
      try {
        await easybrokerService.getPropertyDetails('');
      } catch (error) {
        expect(error.message).to.equal('Invalid property ID');
      }
    });
  });

  describe('addMetaTag', () => {
    let axiosPostStub;

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should add Meta tag to a property', async () => {
      const mockResponse = { success: true };
      axiosPostStub.resolves({ data: mockResponse });

      const response = await easybrokerService.addMetaTag('valid_id');
      expect(response).to.deep.equal(mockResponse);
    });

    it('should throw an error if adding Meta tag fails', async () => {
      axiosPostStub.rejects(new Error('Failed to add Meta tag'));

      try {
        await easybrokerService.addMetaTag('valid_id');
      } catch (error) {
        expect(error.message).to.equal('Failed to add Meta tag.');
      }
    });
  });

  describe('checkMetaTag', () => {
    it('should return true if property has Meta tag', () => {
      const property = { tags: ['Meta'] };
      const hasMetaTag = easybrokerService.checkMetaTag(property);
      expect(hasMetaTag).to.be.true;
    });

    it('should return false if property does not have Meta tag', () => {
      const property = { tags: ['OtherTag'] };
      const hasMetaTag = easybrokerService.checkMetaTag(property);
      expect(hasMetaTag).to.be.false;
    });
  });
});
