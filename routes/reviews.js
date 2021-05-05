const express = require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


// add a review to a campground
router.post('/', 
    isLoggedIn, 
    validateReview, 
    catchAsync(reviews.createReview)
);

router.delete('/:reviewID', 
    isLoggedIn, 
    isReviewAuthor, 
    catchAsync(reviews.deleteReview)
);

module.exports = router