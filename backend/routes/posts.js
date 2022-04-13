const express = require("express");
const Post = require('../models/post');

const router = express.Router();


router.post('',(request, response, next) => {
  const post = new Post({
    title: request.body.title,
    content: request.body.content
  });
  post.save().then(createdPost =>{
    response.status(201).json({
      message: 'Post Added Successfully',
      postId: createdPost._id
    });
  });

});

router.put('/:id',(request, response, next) => {
  const post = new Post({
    _id: request.body.id,
    title: request.body.title,
    content: request.body.content
  });
  Post.updateOne({_id: request.params.id},post).then(createdPost =>{
    response.status(201).json({
      message: 'Post updated Successfully',

    });
  });

});

router.get('',(request, response, next) => {
    Post.find().then((documents) =>{
      console.log(documents);
       response.status(200).json({
        message: 'Posts fetched succesfully',
        posts: documents
      });
    });
  //   const posts = [
  //   {id: 'fadf12421l', title: 'first server side post', content: 'this is coming from the server'},
  //   {id: 'fadf124213231l', title: 'second server side post', content: 'this is coming from the server'},

  // ];


});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

router.delete("/:id", (request, response, next) => {
  Post.deleteOne({_id:request.params.id}).then(result =>{
    console.log(result);
    response.status(200).json({message:'Post Deleted'});
  });

});

module.exports = router;
