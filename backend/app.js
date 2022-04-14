const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();
mongoose.connect('mongodb+srv://ricardodanielmar:Goldenr20@cluster0.reqeu.mongodb.net/postsdb?w=majority')
.then(()=>{
  console.log('connected to db');
}).catch((error)=>{
  console.log('connection error: ',error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/images',express.static(path.join('backend/images')));
app.use((request,response,next)=>{
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api/posts",postsRoutes);

app.use("/api/user",userRoutes);



module.exports = app;
