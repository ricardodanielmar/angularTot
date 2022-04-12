const express = require('express');
const bodyParser = require('body-parser');
const Post = require('./models/post');
const mongoose = require('mongoose');

const app = express();
mongoose.connect('mongodb+srv://ricardodanielmar:Goldenr20@cluster0.reqeu.mongodb.net/postsdb?retryWrites=true&w=majority')
.then(()=>{
  console.log('connected to db');
}).catch((error)=>{
  console.log('connection error: ',error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((request,response,next)=>{
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.post('/api/posts',(request, response, next) => {
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

app.get('/api/posts',(request, response, next) => {
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

app.delete("/api/posts/:id", (request, response, next) => {
  Post.deleteOne({_id:request.params.id}).then(result =>{
    console.log(result);
    response.status(200).json({message:'Post Deleted'});
  });

});

module.exports = app;
