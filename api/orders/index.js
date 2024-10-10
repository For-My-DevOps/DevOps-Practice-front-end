import async from 'async';
import express from 'express';
import axios from 'axios';
import * as endpoints from '../endpoints.js';
import * as helpers from '../../helpers/index.js';

const app = express();

// List orders for the current logged-in user
app.get('/orders', async (req, res, next) => {
    try {
        console.log('Request received with body:', JSON.stringify(req.body));
        const logged_in = req.cookies.logged_in;

        if (!logged_in) {
            throw new Error('User not logged in.');
        }

        const custId = req.session.customerId;
        const response = await axios.get(`${endpoints.ordersUrl}/orders/search/customerId?sort=date&custId=${custId}`);
        const orders = response.data._embedded?.customerOrders || [];
        helpers.respondStatusBody(res, 201, orders);
    } catch (error) {
        next(error);
    }
});

// Proxy GET requests to orders API
app.get('/orders/*', async (req, res, next) => {
    try {
        const url = `${endpoints.ordersUrl}${req.url}`;
        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        next(error);
    }
});

// Create a new order for the logged-in user
app.post('/orders', async (req, res, next) => {
    try {
        console.log('Request received with body:', JSON.stringify(req.body));
        const logged_in = req.cookies.logged_in;

        if (!logged_in) {
            throw new Error('User not logged in.');
        }

        const custId = req.session.customerId;
        const customerResponse = await axios.get(`${endpoints.customersUrl}/${custId}`);
        const customerData = customerResponse.data;
        const customerLink = customerData._links.customer.href;
        const addressLink = customerData._links.addresses.href;
        const cardLink = customerData._links.cards.href;

        let order = {
            customer: customerLink,
            address: null,
            card: null,
            items: `${endpoints.cartsUrl}/${custId}/items`
        };

        const [addressResponse, cardResponse] = await Promise.all([
            axios.get(addressLink),
            axios.get(cardLink)
        ]);

        if (addressResponse.data._embedded?.address[0]) {
            order.address = addressResponse.data._embedded.address[0]._links.self.href;
        }

        if (cardResponse.data._embedded?.card[0]) {
            order.card = cardResponse.data._embedded.card[0]._links.self.href;
        }

        const orderResponse = await axios.post(`${endpoints.ordersUrl}/orders`, order);
        helpers.respondStatusBody(res, orderResponse.status, orderResponse.data);
    } catch (error) {
        next(error);
    }
});

export default app;
