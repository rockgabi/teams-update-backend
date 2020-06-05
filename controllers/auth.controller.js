const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models').User;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

function generateAccessToken(user) {
    // expires after half and hour (1800 seconds = 30 minutes)
    return jwt.sign(user, config.token_secret, { expiresIn: '1800h' });
}

module.exports = {
    async register(req, res) {
        const email = req.body.email
        const existingUser = await User.findOne({ where: { email } });
        const admin = req.body.admin ? req.body.admin : false;

        if (existingUser) return res.status(409).send({ error: 'email_in_use' });

        const data = Object.assign({}, req.body, { admin });
        const password = req.body.password && req.body.password != "" ? bcrypt.hashSync(req.body.password, 10) : "";
        data.password = password;
        data.role = 'student';

        let user;
        try {
            user = await User.create(data);
            user = user.get();
            delete user.password;
        } catch (error) {
            console.log('Error ', error);
            return res.status(500).send({ error: error });
        }

        console.log('User ', user);
        const token = generateAccessToken(user);

        return res.status(201).send({ token, user });
    },
     
    async login(req, res) {
        const email = req.body.email;
        const password = req.body.password;
        const existingUser = await User.findOne({ where: { email } });

        if (!existingUser) res.status(400).send({ error: 'user_not_found' });

        const matches = bcrypt.compare(password, existingUser.password);

        if (!matches) res.status(400).send({ error: 'password_does_not_match' });

        const user = existingUser.get();
        delete user.password;
        const token = generateAccessToken(user);

        return res.status(200).send({ token, user });
    },
    
}