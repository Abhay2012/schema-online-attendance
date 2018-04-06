const jwt = require('jsonwebtoken');
const secret = require('./config').secret;

module.exports = {
    createToken: (payload) => {
        return jwt.sign(payload, secret)
    },
    verifyToken: (token) => {
        return jwt.verify(token, secret);
    }
}