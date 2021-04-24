const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware');


// a middleware function used to validate the campground
// request body
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// the index route that shows all campgrounds
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// the new route that used to create a new campground
// order matters here, the new rout should be put before
// the /campground/:id route
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

// the post route that update the database after 
// new campground is entered (generated by the form
// of the '/campgrounds/new' route)
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // everything is grouped into campground in the request body
    // in the form
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// the show route that display a single campground
router.get('/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground){
        req.flash('error', 'Cannot find this campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

// the route that servers a form to edit a campground
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find this campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

// the route that edits an campground entry in the database
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // spread the campground object into a new object
    const newCamp = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true }
    );
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

// delete route to delete a campground
router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');
}))

module.exports = router;