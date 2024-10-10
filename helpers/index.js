'use strict';

const axios = require("axios");
const helpers = {};

/* Public: errorHandler is a middleware that handles your errors */
helpers.errorHandler = function (err, req, res, next) {
    const ret = {
        message: err.message,
        error: err
    };
    res.status(err.status || 500).send(ret);
};

/* Middleware to manage session */
helpers.sessionMiddleware = function (req, res, next) {
    if (!req.cookies.logged_in) {
        req.session.customerId = null;
    }
    next();
};

/* Responds with the given body and status 200 OK */
helpers.respondSuccessBody = function (res, body) {
    helpers.respondStatusBody(res, 200, body);
};

/* Public: responds with the given body and status */
helpers.respondStatusBody = function (res, statusCode, body) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(body));
    res.end();
};

/* Responds with the given statusCode */
helpers.respondStatus = function (res, statusCode) {
    res.writeHead(statusCode);
    res.end();
};

/* Rewrites and redirects any URL that doesn't end with a slash */
helpers.rewriteSlash = function (req, res, next) {
    if (req.url.endsWith('/') && req.url.length > 1) {
        res.redirect(301, req.url.slice(0, -1));
    } else {
        next();
    }
};

/* Public: performs an HTTP GET request to the given URL using axios */
helpers.simpleHttpRequest = async function (url, res, next) {
    try {
        const response = await axios.get(url);
        helpers.respondSuccessBody(res, response.data);
    } catch (error) {
        next(error);
    }
};

/* Retrieves the customer ID from the request */
helpers.getCustomerId = function (req, env) {
    const logged_in = req.cookies.logged_in;

    // TODO REMOVE THIS, SECURITY RISK
    if (env === "development" && req.query.custId != null) {
        return req.query.custId;
    }

    if (!logged_in) {
        if (!req.session.id) {
            throw new Error("User not logged in.");
        }
        // Use Session ID instead
        return req.session.id;
    }

    return req.session.customerId;
};

module.exports = helpers;
