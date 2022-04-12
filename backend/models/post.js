const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: {type: String, required: true},
  title: {type: String, required: false},
});

module.exports = mongoose.model('Post', postSchema);
