import express from 'express';
import axios from 'axios';
import * as endpoints from '../endpoints.js';
import * as helpers from '../../helpers/index.js';

const app = express();

// Helper function to strip trailing slash from URL if present
function stripTrailingSlash(url) {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

// Route to handle specific catalogue item requests
app.get('/catalogue/:id', async (req, res) => {
    try {
        // Explicitly include '/catalogue' in the URL to ensure it is properly constructed
        const url = `${endpoints.catalogueUrl}/catalogue/${req.params.id}`;
        console.log(`Fetching data from: ${url}`);
        const response = await axios.get(url);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error fetching catalogue data:', error.message);
        res.status(500).send({ error: 'Failed to fetch catalogue data' });
    }
});


// Route to handle catalogue image requests
app.get('/catalogue/images*', async (req, res, next) => {
    try {
        const url = stripTrailingSlash(endpoints.catalogueUrl) + req.url.toString();
        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching catalogue image:', error.message);
        res.status(500).send({ error: 'Failed to fetch catalogue image' });
    }
});


// Route to handle general catalogue requests
app.get('/catalogue*', async (req, res, next) => {
    try {
        const url = endpoints.catalogueUrl + req.url.replace('/catalogue/', '/catalogue'); // Normalize URL
        console.log(`Fetching data from: ${url}`);
        const response = await axios.get(url);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error fetching catalogue data:', error.message);
        res.status(500).send({ error: 'Failed to fetch catalogue data' });
    }
});


// Route to handle tag requests
app.get('/tags', async (req, res, next) => {
    try {
        const url = stripTrailingSlash(endpoints.tagsUrl);
        console.log(`Fetching tags from: ${url}`);
        const response = await axios.get(url);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error fetching tags:', error.message);
        res.status(500).send({ error: 'Failed to fetch tags' });
    }
});

export default app;
