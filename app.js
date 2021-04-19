const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

// connect method returns a promise
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    // get rid of the deprecation warning
    useFindAndModify: false
});

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

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'blahblahblahblah',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

// the campground routes
app.use('/campgrounds', campgrounds);

// the review routes
app.use('/campgrounds/:id/reviews', reviews);

// the home page route
app.get('/', (req, res) => {
    res.render('home');
});

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