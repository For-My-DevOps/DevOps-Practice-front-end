const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const config = require("./config");
const helpers = require("./helpers");
const cart = require("./api/cart");
const catalogue = require("./api/catalogue");
const orders = require("./api/orders");
const user = require("./api/user");
const metrics = require("./api/metrics");

const app = express();

// Middleware for handling slash rewrites and static files
app.use(helpers.rewriteSlash);
app.use(metrics);
app.use(express.static("public"));

// Session management setup with Redis fallback to local session manager
if (config.session_redis.store) {
    console.log('Using Redis-based session manager');
    app.use(session(config.session_redis));
} else {
    console.log('Using in-memory session manager');
    app.use(session(config.session));
}

// Built-in Express middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helpers.sessionMiddleware);
app.use(morgan("dev"));

// Domain setup from command line arguments
let domain = "";
process.argv.forEach((val) => {
    const [key, value] = val.split("=");
    if (key === "--domain" && value) {
        domain = value;
        console.log("Setting domain to:", domain);
    }
});

/* Mount API endpoints */
app.use(cart);
app.use(catalogue);
app.use(orders);
app.use(user);

// Error handling middleware
app.use(helpers.errorHandler);

// Start the server
const PORT = process.env.PORT || 8079;
app.listen(PORT, () => {
    console.log(`App now running in ${app.get("env")} mode on port ${PORT}`);
});
