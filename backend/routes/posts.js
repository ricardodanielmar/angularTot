const express = require("express");
const multer = require('multer');
const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');
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

router.post('',
checkAuth
,multer({storage: storage}).single('image'),(request, response, next) => {
  const url = request.protocol + '://' + request.get('host');
  const post = new Post({
    title: request.body.title,
    content: request.body.content,
    imagePath: `${url}/images/${request.file.filename}`,
    creator: request.userData.userId
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

router.put('/:id',checkAuth,multer({storage: storage}).single('image'),(request, response, next) => {
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
    imagePath: imagePath,
    creator: request.userData.userId
  });

  Post.updateOne({_id: request.params.id, creator: request.userData.userId},post).then(result =>{
    console.log(result);
    result.modifiedCount > 0 ?
    response.status(200).json({
      message: 'Post updated Successfully',

    }):    response.status(401).json({
      message: 'Not your Post to Update',

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

router.delete("/:id",checkAuth, (request, response, next) => {
  Post.deleteOne({_id:request.params.id, creator: request.userData.userId}).then(result =>{
    console.log(result);
    result.deletedCount > 0 ?
    response.status(200).json({
      message: 'Post deleted Successfully',

    }):    response.status(401).json({
      message: 'Not your Post to delete',

    });
  });

});

module.exports = router;
