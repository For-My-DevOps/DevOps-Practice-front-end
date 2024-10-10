'use strict';

const express = require("express");
const axios = require("axios");
const endpoints = require("../endpoints");
const helpers = require("../../helpers");
const app = express();

app.get("/catalogue/images*", async (req, res, next) => {
    try {
        const url = endpoints.catalogueUrl + req.url.toString();
        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        next(error);
    }
});

app.get("/catalogue*", (req, res, next) => {
    helpers.simpleHttpRequest(endpoints.catalogueUrl + req.url.toString(), res, next);
});

app.get("/tags", (req, res, next) => {
    helpers.simpleHttpRequest(endpoints.tagsUrl, res, next);
});

module.exports = app;
