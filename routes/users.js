const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')


// the route of the registration form
router.get('/register', (req, res) => {
    res.render('users/register');
})

// the register route to create a new user
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        })
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('register');
    } 
}));

// the login routes
router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:true}), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

// the logout routes
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have been successfully logged out.')
    res.redirect('/campgrounds');
})

module.exports = router;