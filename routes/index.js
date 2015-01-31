var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/**
 * POSTS ROUTES
 */

/* GET /posts */
// req (request) contains all information about the request
// res (response) is the object used to respond to the client
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts) {
    if (err) { return next(err); } // next(...) is an error handling function

    res.json(posts); // otherwise send retrieved posts back to client
  })
});

/* POST /posts */
router.post('/posts', function(req, res, next) {
  // create instance of Post model in memory from request body (both are JSON)
  var post = new Post(req.body);

  post.save(function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

/* Preload req.post on routes with a :post id defined. */
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id); // Mongoose's "query interface"

  query.exec(function(err, post) {
    if (err) { return next(err); }
    if (!post) { return next(new Error("can't find post")); }

    req.post = post;
    return next();
  });
});

/* GET /posts/:post */
router.get('/posts/:post', function(req, res) {
  // load in the comments associated with the preloaded post, then return the post
  req.post.populate('comments', function(err, post) {
    res.json(post);
  });
});

/* PUT /posts/:post/upvote */
router.put('/posts/:post/upvote', function(req, res, next) {
  // since req has preloaded post instance, we can call the upvote() function
  // and then return the post (with updated upvote field)
  req.post.upvote(function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

/**
 * COMMENTS ROUTES
 */

/* POST /posts/:post/comments */
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body); // create instance of Comment model from request body
  comment.post = req.post; // create the link to the pre-loaded Post

  // save Comment to db, on success add to the Post's comments
  // and then save the Post, and return the comment when all successful
  comment.save(function(err, comment) {
    if (err) { return next(err); }

    req.post.comments.push(comment); // add comment to pre-loaded Post
    req.post.save(function(err, post) { // save Post and return comment
      if (err) { return next(err); }

      res.json(comment);
    });
  });
});

/* Attach comment to req whenever a route is defined with :comment */
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function(err, comment) {
    if (err) { return next(err); }
    if (!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});

/* PUT /posts/:post/comments/:comment/upvote */
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  // call upvote method on preloaded comment, and return updated comment
  req.comment.upvote(function(err, comment) {
    if (err) { return next(err); }

    res.json(comment);
  });
});

module.exports = router;