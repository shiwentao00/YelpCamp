const joi = require('joi');

// used to validate the incoming form
const campgroundSchema = joi.object({
    // there should be a key called campground
    campground: joi.object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.string().required(),
        location: joi.string().required(),
        description: joi.string().required()
    }).required()
})

module.exports.campgroundSchema = campgroundSchema;