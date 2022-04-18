import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map} from "rxjs/operators";
import { Router } from '@angular/router';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[],postCount: number}>();
  public get Posts(): Post[] {
    return [...this.posts];
  }
  public set Posts(value: Post[]) {
    this.posts = value;
  }

  /**
   *
   */
  constructor(private http: HttpClient, private router: Router) {

  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams= `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any,maxPosts: number }>('http://localhost:3000/api/posts'+queryParams).pipe(map((postData) =>{return {
      posts: postData.posts.map((post: any) =>{ return {title: post.title, content: post.content, id: post._id, imagePath: post.imagePath, creator: post.creator}}),
    maxPosts: postData.maxPosts}})).subscribe((postData) => {
      this.posts = postData.posts;
      this.postsUpdated.next({posts:[...this.posts],postCount:postData.maxPosts});
    });

  }

  getPost(id: string | null){
    return this.http.get<{ _id: string; title: string; content: string, imagePath: string, creator:string }>(
      "http://localhost:3000/api/posts/" + id
    );
  }

  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image,title);

    this.http.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData).subscribe((responseData) => {

      this.router.navigate(['/']);
    });

  }

  updatePost(id:string, title:string, content:string, image: File | string){
    let post: Post | FormData;
    console.log(image);
    if(typeof(image)=== 'object'){
      post = new FormData();
      post.append('id',id);
      post.append('title',title);
      post.append('content',content);
      post.append('image',image,title);

    }
    else {
       post ={ id:id,title:title,content:content, imagePath: image, creator: ''};

    }
    this.http.put('http://localhost:3000/api/posts/'+id,post).subscribe(() => {

      this.router.navigate(['/']);

    });
  }

  deletePost(postId:string){
    return this.http.delete('http://localhost:3000/api/posts/' + postId)

  }

}
