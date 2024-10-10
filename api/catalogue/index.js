import express from 'express';
import axios from 'axios';
import * as endpoints from '../endpoints.js';
import * as helpers from '../../helpers/index.js';

const app = express();

app.get('/catalogue/images*', async (req, res, next) => {
    try {
        const url = endpoints.catalogueUrl + req.url.toString();
        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        next(error);
    }
});

app.get('/catalogue*', (req, res, next) => {
    helpers.simpleHttpRequest(endpoints.catalogueUrl + req.url.toString(), res, next);
});

app.get('/tags', (req, res, next) => {
    helpers.simpleHttpRequest(endpoints.tagsUrl, res, next);
});

export default app;
