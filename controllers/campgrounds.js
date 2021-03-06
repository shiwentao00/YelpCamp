const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {    
    // everything is grouped into campground in the request body
    // in the form
    const campground = new Campground(req.body.campground);

    // get geo info with MAP_BOX API
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    // add geo info
    campground.geometry = geoData.body.features[0].geometry;

    // map the url and name of the uploaded image into an object
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    
    // link campground with current user
    campground.author = req.user._id;
    console.log(campground)

    await campground.save();
    // console.log(campground)
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find this campground!');
        return res.redirect('/campgrounds');
    }
    // console.log(campground);
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find this campground!');
        return res.redirect('/campgrounds');
    }
    //if (!campground.author.equals(req.user._id)) {
    //    req.flash('error', 'You do not have the permission to do that!');
    //    return res.redirect(`/campgrounds/${id}`)
    //}
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    // spread the campground object into a new object
    const campground = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true }
    );
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images);
    await campground.save();

    // delete images 
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: { $in: req.body.deleteImages}}}});
        console.log(campground);
    }

    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');
}