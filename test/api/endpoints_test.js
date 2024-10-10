import { expect } from 'chai';
import { 
  catalogueUrl, 
  tagsUrl, 
  cartsUrl, 
  ordersUrl, 
  customersUrl, 
  addressUrl, 
  cardsUrl, 
  loginUrl, 
  registerUrl 
} from '../../api/endpoints.js';

describe('endpoints', function () {
  describe('catalogueUrl', function () {
    it('points to the proper endpoint', function () {
      expect(catalogueUrl).to.equal('http://catalogue');
    });
  });

  describe('tagsUrl', function () {
    it('points to the proper endpoint', function () {
      expect(tagsUrl).to.equal('http://catalogue/tags');
    });
  });

  describe('cartsUrl', function () {
    it('points to the proper endpoint', function () {
      expect(cartsUrl).to.equal('http://carts/carts');
    });
  });

  describe('ordersUrl', function () {
    it('points to the proper endpoint', function () {
      expect(ordersUrl).to.equal('http://orders');
    });
  });

  describe('customersUrl', function () {
    it('points to the proper endpoint', function () {
      expect(customersUrl).to.equal('http://user/customers');
    });
  });

  describe('addressUrl', function () {
    it('points to the proper endpoint', function () {
      expect(addressUrl).to.equal('http://user/addresses');
    });
  });

  describe('cardsUrl', function () {
    it('points to the proper endpoint', function () {
      expect(cardsUrl).to.equal('http://user/cards');
    });
  });

  describe('loginUrl', function () {
    it('points to the proper endpoint', function () {
      expect(loginUrl).to.equal('http://user/login');
    });
  });

  describe('registerUrl', function () {
    it('points to the proper endpoint', function () {
      expect(registerUrl).to.equal('http://user/register');
    });
  });
});
