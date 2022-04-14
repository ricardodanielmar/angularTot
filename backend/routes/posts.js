const express = require("express");
const multer = require('multer');
const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg'

};

const storage = multer.diskStorage({
  destination: (req,file,callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    callback(error,'backend/images');
  },
  filename: (req, file,callback) =>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null,`${name}-${Date.now()}.${ext}`);
  }
})

router.post('',multer({storage: storage}).single('image'),(request, response, next) => {
  const url = request.protocol + '://' + request.get('host');
  const post = new Post({
    title: request.body.title,
    content: request.body.content,
    imagePath: `${url}/images/${request.file.filename}`
  });
  post.save().then(createdPost =>{
    response.status(201).json({
      message: 'Post Added Successfully',
      post:{
        ...createdPost,
        id: createdPost._id,
      }
    });
  });

});

router.put('/:id',multer({storage: storage}).single('image'),(request, response, next) => {
  let imagePath = request.body.imagePath;
  console.log(imagePath);
  if(request.file) {
const url = request.protocol + "://" + request.get("host");
imagePath = url + "/images/" + request.file.filename;
  }
  const post = new Post({
    _id: request.body.id,
    title: request.body.title,
    content: request.body.content,
    imagePath: imagePath
  });

  Post.updateOne({_id: request.params.id},post).then(createdPost =>{
    response.status(201).json({
      message: 'Post updated Successfully',

    });
  });

});

router.get('',(request, response, next) => {
  const pageSize = +request.query.pagesize;
  const currentPage = +request.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
if(pageSize && currentPage){
postQuery.skip(pageSize * (currentPage - 1))
.limit(pageSize);
}
    postQuery.then((documents) =>{
      fetchedPosts = documents;
      return Post.count();

    }).then(count =>{
      response.status(200).json({
        message: 'Posts fetched succesfully',
        posts: fetchedPosts,
        maxPosts: count
      })
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
