const express = require('express');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/users');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(
        passport.authenticate('local', { failureFlash: true, failureRedirect: true }),
        users.login
    );

// the logout routes
router.get('/logout', users.logout);

module.exports = router;