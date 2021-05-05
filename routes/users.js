const express = require('express');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/users');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')


// the route of the registration form
router.get('/register', users.renderRegisterForm);

// the register route to create a new user
router.post('/register', catchAsync(users.register));

// the login routes
router.get('/login', users.renderLogin);

router.post('/login', 
    passport.authenticate('local', {failureFlash:true, failureRedirect:true}), 
    users.login
);

// the logout routes
router.get('/logout', users.logout);

module.exports = router;