// Import mongoose
const mongoose = require('mongoose');
// Create schema definition object
const schemaDefinition = {
    name: {
        type: String,
        require: true
    }, 
    publishDate: {
        type: Date
    }, 
    category: {
        type: String, 
        required: true
    }, 
    author: {
        type: String, 
        required: true
    }, 
    description: {
        type: String, 
        required: true
    }, 
    picture: {
        data: Buffer, // Store binary data of the picture
        contentType: String // Store the MIME type of the picture
    }
};
// Create mongoose schema using the def object
var mongooseSchema = new mongoose.Schema(schemaDefinition)
// Create and export a mongoose Model
module.exports = mongoose.model('Portfolio', mongooseSchema)