var mongoose = require('mongoose');

var optionSchema = new mongoose.Schema({
    option: String
})

var questionSchema = new mongoose.Schema({
    classtype: String,
    unitcode: String,
    week: String,
    question: String,
    options: [optionSchema],
    correctanswer: String
})

var questions = mongoose.model('question', questionSchema)

module.exports = questions