const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
        min: 0,
    },
    tags: {
        type: [String],
    },
})

module.exports = mongoose.model("Project", projectSchema);