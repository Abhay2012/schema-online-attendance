const crypto = require('crypto');

function getSalt(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);
}

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

module.exports = {
    createPassword : function(password) {
        var salt = getSalt(10);
        return sha512(password, salt);
    },
    matchPassword : function(password, salt){
        return sha512(password, salt)
    }
}