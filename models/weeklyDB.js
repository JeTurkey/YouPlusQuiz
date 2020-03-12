var mongoose = require('mongoose');

var weeklySchema = new mongoose.Schema({
    classcode: String,
    week: String,
    weeklycontent: String,
    weeklytitle: String
})

var weekly = mongoose.model('week', weeklySchema)

module.exports = weekly