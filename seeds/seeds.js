const mongoose = require("mongoose");
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    // clear all data in the database first
    // await Campground.deleteMany({});

    // the random campgrounds to make the cluster-map look better
    for (let i = 0; i < 300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100 + 100)
        const newCamp = new Campground({
            author: '608a02b4da42191b0038c2b3', // the 'julia1984, abcd1234', first user
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            price: price,
            geometry: { 
                "coordinates": [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ],
                "type": "Point" 
            },
            description: "Beauiful place!",
            images: [
                {
                    url: 'https://res.cloudinary.com/dsdvo85kp/image/upload/v1620869697/YelpCamp/umo9dfkbhkjtuwfahpdi.jpg',
                    filename: 'YelpCamp/umo9dfkbhkjtuwfahpdi'
                },
                {
                    url: 'https://res.cloudinary.com/dsdvo85kp/image/upload/v1620869704/YelpCamp/ne8tcgqflz7ej1whmhln.jpg',
                    filename: 'YelpCamp/ne8tcgqflz7ej1whmhln'
                }
            ]
        })
        await newCamp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});