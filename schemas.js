const Joi = require('joi');
const joi = require('joi');

// used to validate the incoming form
module.exports.campgroundSchema = joi.object({
    // there should be a key called campground
    campground: joi.object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        // image: joi.string().required(),
        location: joi.string().required(),
        description: joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        body: joi.string().required()
    }).required()
})