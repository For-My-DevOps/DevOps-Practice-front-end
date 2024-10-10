import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import config from './config.js';
import * as helpers from './helpers/index.js';
import cart from './api/cart/index.js';
import catalogue from './api/catalogue/index.js';
import orders from './api/orders/index.js';
import user from './api/user/index.js';
import metrics from './api/metrics/index.js';

const app = express();

// Middleware to remove trailing slash from all incoming requests
app.use((req, res, next) => {
    if (req.url !== '/' && req.url.endsWith('/')) {
        req.url = req.url.slice(0, -1);
    }
    next();
});


// Middleware for handling slash rewrites and static files
app.use(helpers.rewriteSlash);
app.use(metrics);
app.use(express.static('public'));

// Session management setup
if (process.env.SESSION_REDIS) {
    console.log('Using the Redis-based session manager');
    app.use(session(config.session_redis));
} else {
    console.log('Using local session manager');
    app.use(session(config.session));
}

// Built-in Express middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helpers.sessionMiddleware);
app.use(morgan('dev'));

// Domain setup from command line arguments
let domain = '';
process.argv.forEach((val) => {
    const [key, value] = val.split('=');
    if (key === '--domain' && value) {
        domain = value;
        console.log('Setting domain to:', domain);
    }
});

/* Mount API endpoints */
app.use(cart);
app.use(catalogue);
app.use(orders);
app.use(user);

app.use(helpers.errorHandler);

// Start the server
const PORT = process.env.PORT || 8079;
app.listen(PORT, () => {
    console.log(`App now running in ${app.get('env')} mode on port ${PORT}`);
});

