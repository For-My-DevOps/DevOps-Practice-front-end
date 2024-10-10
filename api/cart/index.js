import async from 'async';
import express from 'express';
import axios from 'axios';
import * as helpers from '../../helpers/index.js';
import * as endpoints from '../endpoints.js';

const app = express();

// List items in cart for current logged-in user
app.get('/cart', async (req, res, next) => {
    try {
        console.log('Request received:', req.url, req.query.custId);
        const custId = helpers.getCustomerId(req, app.get('env'));
        console.log('Customer ID:', custId);
        const response = await axios.get(`${endpoints.cartsUrl}/${custId}/items`);
        helpers.respondStatusBody(res, response.status, response.data);
    } catch (error) {
        next(error);
    }
});

// Delete cart
app.delete('/cart', async (req, res, next) => {
    try {
        const custId = helpers.getCustomerId(req, app.get('env'));
        console.log('Attempting to delete cart for user:', custId);
        const response = await axios.delete(`${endpoints.cartsUrl}/${custId}`);
        console.log('User cart deleted with status:', response.status);
        helpers.respondStatus(res, response.status);
    } catch (error) {
        next(error);
    }
});

// Delete item from cart
app.delete('/cart/:id', async (req, res, next) => {
    if (!req.params.id) {
        return next(new Error('Must pass id of item to delete'), 400);
    }

    console.log('Delete item from cart:', req.url);
    const custId = helpers.getCustomerId(req, app.get('env'));

    try {
        const response = await axios.delete(`${endpoints.cartsUrl}/${custId}/items/${req.params.id}`);
        console.log('Item deleted with status:', response.status);
        helpers.respondStatus(res, response.status);
    } catch (error) {
        next(error);
    }
});

// Add new item to cart
app.post('/cart', async (req, res, next) => {
    console.log('Attempting to add to cart:', JSON.stringify(req.body));

    if (!req.body.id) {
        return next(new Error('Must pass id of item to add'), 400);
    }

    const custId = helpers.getCustomerId(req, app.get('env'));

    try {
        const catalogueResponse = await axios.get(`${endpoints.catalogueUrl}/catalogue/${req.body.id}`);
        const item = catalogueResponse.data;

        const options = {
            url: `${endpoints.cartsUrl}/${custId}/items`,
            method: 'POST',
            data: { itemId: item.id, unitPrice: item.price },
        };
        console.log('POST to carts:', options.url, 'body:', JSON.stringify(options.data));

        const response = await axios(options);
        if (response.status !== 201) {
            return next(new Error(`Unable to add to cart. Status code: ${response.status}`));
        }

        helpers.respondStatus(res, response.status);
    } catch (error) {
        next(error);
    }
});

// Update cart item
app.post('/cart/update', async (req, res, next) => {
    console.log('Attempting to update cart item:', JSON.stringify(req.body));

    if (!req.body.id) {
        return next(new Error('Must pass id of item to update'), 400);
    }
    if (req.body.quantity == null) {
        return next(new Error('Must pass quantity to update'), 400);
    }

    const custId = helpers.getCustomerId(req, app.get('env'));

    try {
        const catalogueResponse = await axios.get(`${endpoints.catalogueUrl}/catalogue/${req.body.id}`);
        const item = catalogueResponse.data;

        const options = {
            url: `${endpoints.cartsUrl}/${custId}/items`,
            method: 'PATCH',
            data: { itemId: item.id, quantity: parseInt(req.body.quantity), unitPrice: item.price },
        };
        console.log('PATCH to carts:', options.url, 'body:', JSON.stringify(options.data));

        const response = await axios(options);
        if (response.status !== 202) {
            return next(new Error(`Unable to update cart item. Status code: ${response.status}`));
        }

        helpers.respondStatus(res, response.status);
    } catch (error) {
        next(error);
    }
});

export default app;
