module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // store the url the request came from
        req.session.returnTo = req.originalUrl;

        req.flash('error', 'You need to be signed in to add a new campground.');
        return res.redirect('/login');
    }
    next();
}