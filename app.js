const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review')

// connect method returns a promise
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

/*
    .then(() => {
        console.log("Mongo connection open!");
    })
    .catch(err => {
        console.log("Mongo connection error!");
        console.log(err);
    })
*/

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Mongo database connected.');
});

const app = express();

// set the view engine as EJS
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// tell express to parse the request body of post request
app.use(express.urlencoded({ extended: true }));

// used to override post with patch/put for the edit route
app.use(methodOverride('_method'));

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

// a middleware function used to validate the review
// request body
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

// the index route that shows all campgrounds
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// the new route that used to create a new campground
// order matters here, the new rout should be put before
// the /campground/:id route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// the post route that update the database after 
// new campground is entered (generated by the form
// of the '/campgrounds/new' route)
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // everything is grouped into campground in the request body
    // in the form
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// the show route that display a single campground
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))

// the route that servers a form to edit a campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

// the route that edits an campground entry in the database
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // spread the campground object into a new object
    const newCamp = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true }
    );
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

// delete route to delete a campground
app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// add a review to a campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// define a simple middleware to handle undefined routes
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// error handling route
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Undefined Error!';
    res.status(statusCode).render('error', { err });
})


// start the server
app.listen(8080, () => {
    console.log('Serving on port 8080!');
})