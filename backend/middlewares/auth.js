const jsonwebtoken = require('jsonwebtoken');
const { JWT_PUBLIC_KEY } = require('../config/keys');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (token == null) return res.sendStatus(401); // No token present

  jsonwebtoken.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] }, (err, data) => {
    if (err) return res.sendStatus(403); // Invalid token

    req.sub = data.sub; // Set the user id in the request
    next();
  });
};

module.exports = authenticateToken;
