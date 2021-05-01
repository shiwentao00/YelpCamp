const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // store the url the request came from
        req.session.returnTo = req.originalUrl;

        req.flash('error', 'You need to be signed in to do that.');
        return res.redirect('/login');
    }
    next();
}

// a middleware function used to validate the campground
// request body
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// a middleware that performs authorization of a campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    //if (!campground) {
    //    req.flash('error', 'Cannot find this campground!');
    //    return res.redirect('/campgrounds');
    //}
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// a middleware that performs authorization of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    // the route is /campgrounds/id/reviews/reviewID/
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// a middleware function used to validate the review
// request body
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}