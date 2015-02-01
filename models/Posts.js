var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    upvotes: {
        type: Number,
        default: 0
    },
    comments: [{
        // type is an ObjectId - a 12byte id stored in db
        type: mongoose.Schema.Types.ObjectId,
        // ref refers to the type of object that the ObjectId references
        ref: 'Comment'
    }]
});

// call upvote and provide function that takes an "err" and the updated schema instance
PostSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};

PostSchema.methods.downvote = function(cb) {
    this.upvotes -= 1;
    this.save(cb);
};

mongoose.model('Post', PostSchema);