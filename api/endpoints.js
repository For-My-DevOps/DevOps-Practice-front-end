'use strict';

let domain = "";

// Extract domain from command line arguments
process.argv.forEach((val) => {
    const [key, value] = val.split("=");
    if (key === "--domain" && value) {
        domain = `.${value}`;
        console.log("Setting domain to:", domain);
    }
});

module.exports = {
    catalogueUrl: `http://catalogue${domain}`,
    tagsUrl: `http://catalogue${domain}/tags`,
    cartsUrl: `http://carts${domain}/carts`,
    ordersUrl: `http://orders${domain}`,
    customersUrl: `http://user${domain}/customers`,
    addressUrl: `http://user${domain}/addresses`,
    cardsUrl: `http://user${domain}/cards`,
    loginUrl: `http://user${domain}/login`,
    registerUrl: `http://user${domain}/register`
};
