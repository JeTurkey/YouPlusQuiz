var mongoose = require('mongoose');

var courseDescriptionSchema = new mongoose.Schema({
    unitcode: String,
    uintname: String,
    unittutor: String
})

var coursedescription = mongoose.model('coursedescription', courseDescriptionSchema)

module.exports = coursedescription