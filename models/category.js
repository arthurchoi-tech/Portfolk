const mongoose = require('mongoose');

const schemaDefinition = {
    name: {
        type: String,
        required: true
    }
};

const coursesSchema = new mongoose.Schema(schemaDefinition);
module.exports = mongoose.model('Category', coursesSchema);