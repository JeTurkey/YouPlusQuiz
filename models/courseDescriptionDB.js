var mongoose = require('mongoose');

var courseDescriptionSchema = new mongoose.Schema({
    class: String,
    nameofcourse: String
})

var coursedescription = mongoose.model('coursedescription', courseDescriptionSchema)

module.exports = coursedescription