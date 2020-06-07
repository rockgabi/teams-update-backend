const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];

const authController = require('./controllers').auth;
const projectsController = require('./controllers').projects;

const User = require('./models').User;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000, () => {
    console.log("El servidor está inicializado en el puerto 3000");
});

// Authentication middleware
function authenticateToken(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401) // if there isn't any token

    jwt.verify(token, config.token_secret, (err, user) => {
        if (!user) return res.sendStatus(403);
        req.user = user;
        next(); // pass the execution off to whatever request the client intended
    });
}

// Admin role middleware
async function restrictAdmin(req, res, next) {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.admin) return res.sendStatus(403);
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
}

// Routes
app.post('/login', authController.login);
app.post('/register', authController.register);

app.get('/restricted', authenticateToken, function (req, res) {
    res.send('Restricted page');
});

app.get('/projects', authenticateToken, projectsController.retrieve);
app.post('/projects', authenticateToken, projectsController.create);
app.put('/projects/:project_id', authenticateToken, projectsController.update);
app.post('/projects/:project_id/users/:email', authenticateToken, projectsController.addUser);
app.delete('/projects/:project_id/users/:user_id', authenticateToken, projectsController.deleteUser);
