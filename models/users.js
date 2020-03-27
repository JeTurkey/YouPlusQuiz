var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var unitSchema = new mongoose.Schema({
    unitcode: String
})

var UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    class: [unitSchema]
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)