'use strict';

const async = require("async");
const express = require("express");
const axios = require("axios");
const endpoints = require("../endpoints");
const helpers = require("../../helpers");
const app = express();
const cookie_name = "logged_in";

app.get("/customers/:id", (req, res, next) => {
    helpers.simpleHttpRequest(`${endpoints.customersUrl}/${req.session.customerId}`, res, next);
});

app.get("/cards/:id", (req, res, next) => {
    helpers.simpleHttpRequest(`${endpoints.cardsUrl}/${req.params.id}`, res, next);
});

app.get("/customers", (req, res, next) => {
    helpers.simpleHttpRequest(endpoints.customersUrl, res, next);
});

app.get("/addresses", (req, res, next) => {
    helpers.simpleHttpRequest(endpoints.addressUrl, res, next);
});

app.get("/cards", (req, res, next) => {
    helpers.simpleHttpRequest(endpoints.cardsUrl, res, next);
});

// Create Customer - TO BE USED FOR TESTING ONLY (for now)
app.post("/customers", async (req, res, next) => {
    try {
        console.log("Posting Customer:", JSON.stringify(req.body));
        const response = await axios.post(endpoints.customersUrl, req.body);
        helpers.respondSuccessBody(res, JSON.stringify(response.data));
    } catch (error) {
        next(error);
    }
});

app.post("/addresses", async (req, res, next) => {
    try {
        req.body.userID = helpers.getCustomerId(req, app.get("env"));
        console.log("Posting Address:", JSON.stringify(req.body));
        const response = await axios.post(endpoints.addressUrl, req.body);
        helpers.respondSuccessBody(res, JSON.stringify(response.data));
    } catch (error) {
        next(error);
    }
});

app.get("/card", async (req, res, next) => {
    try {
        const custId = helpers.getCustomerId(req, app.get("env"));
        const response = await axios.get(`${endpoints.customersUrl}/${custId}/cards`);
        const data = response.data;
        if (data.status_code !== 500 && data._embedded.card.length !== 0) {
            const resp = { "number": data._embedded.card[0].longNum.slice(-4) };
            return helpers.respondSuccessBody(res, JSON.stringify(resp));
        }
        return helpers.respondSuccessBody(res, JSON.stringify({ "status_code": 500 }));
    } catch (error) {
        next(error);
    }
});

app.get("/address", async (req, res, next) => {
    try {
        const custId = helpers.getCustomerId(req, app.get("env"));
        const response = await axios.get(`${endpoints.customersUrl}/${custId}/addresses`);
        const data = response.data;
        if (data.status_code !== 500 && data._embedded.address.length !== 0) {
            return helpers.respondSuccessBody(res, JSON.stringify(data._embedded.address[0]));
        }
        return helpers.respondSuccessBody(res, JSON.stringify({ "status_code": 500 }));
    } catch (error) {
        next(error);
    }
});

app.post("/cards", async (req, res, next) => {
    try {
        req.body.userID = helpers.getCustomerId(req, app.get("env"));
        console.log("Posting Card:", JSON.stringify(req.body));
        const response = await axios.post(endpoints.cardsUrl, req.body);
        helpers.respondSuccessBody(res, JSON.stringify(response.data));
    } catch (error) {
        next(error);
    }
});

// Delete Customer - TO BE USED FOR TESTING ONLY (for now)
app.delete("/customers/:id", async (req, res, next) => {
    try {
        console.log("Deleting Customer:", req.params.id);
        const response = await axios.delete(`${endpoints.customersUrl}/${req.params.id}`);
        helpers.respondSuccessBody(res, JSON.stringify(response.data));
    } catch (error) {
        next(error);
    }
});

// Delete Address - TO BE USED FOR TESTING ONLY (for now)
app.delete("/addresses/:id", async (req, res, next) => {
    try {
        console.log("Deleting Address:", req.params.id);
        const response = await axios.delete(`${endpoints.addressUrl}/${req.params.id}`);
        helpers.respondSuccessBody(res, JSON.stringify(response.data));
    } catch (error) {
        next(error);
    }
});

// Delete Card - TO BE USED FOR TESTING ONLY (for now)
app.delete("/cards/:id", async (req, res, next) => {
    try {
        console.log("Deleting Card:", req.params.id);
        const response = await axios.delete(`${endpoints.cardsUrl}/${req.params.id}`);
        helpers.respondSuccessBody(res, JSON.stringify(response.data));
    } catch (error) {
        next(error);
    }
});

app.post("/register", async (req, res, next) => {
    try {
        console.log("Posting Customer:", JSON.stringify(req.body));
        const response = await axios.post(endpoints.registerUrl, req.body);
        const customerId = response.data.id;
        req.session.customerId = customerId;
        console.log("Merging carts for customer id:", customerId);
        await axios.get(`${endpoints.cartsUrl}/${customerId}/merge?sessionId=${req.session.id}`);
        res.status(200).cookie(cookie_name, req.session.id, { maxAge: 3600000 }).send({ id: customerId });
        console.log("Sent cookies.");
    } catch (error) {
        console.log("Error with registration:", error);
        res.status(500).end();
    }
});

app.get("/login", async (req, res, next) => {
    try {
        console.log("Received login request");
        const options = { headers: { 'Authorization': req.get('Authorization') }, uri: endpoints.loginUrl };
        const response = await axios.get(options.uri, { headers: options.headers });
        const customerId = response.data.user.id;
        req.session.customerId = customerId;
        console.log("Merging carts for customer id:", customerId);
        await axios.get(`${endpoints.cartsUrl}/${customerId}/merge?sessionId=${req.session.id}`);
        res.status(200).cookie(cookie_name, req.session.id, { maxAge: 3600000 }).send('Cookie is set');
        console.log("Sent cookies.");
    } catch (error) {
        console.log("Error with login:", error);
        res.status(401).end();
    }
});

module.exports = app;

