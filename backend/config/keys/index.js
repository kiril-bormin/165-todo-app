const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, 'jwtRS256.key');
const publicKeyPath = path.join(__dirname, 'jwtRS256.key.pub');

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

module.exports = {
  JWT_PRIVATE_KEY: privateKey,
  JWT_PUBLIC_KEY: publicKey
};
