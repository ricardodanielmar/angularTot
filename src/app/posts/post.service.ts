import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map} from "rxjs/operators";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
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

  getPosts() {
    this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts').pipe(map((postData) =>{return postData.posts.map((post: any) =>{ return {title: post.title, content: post.content, id: post._id}})})).subscribe((postData) => {
      this.posts = postData;
      this.postsUpdated.next([...this.posts]);
    });

  }

  getPost(id: string | null){
    return this.http.get<{ _id: string; title: string; content: string }>(
      "http://localhost:3000/api/posts/" + id
    );
  }

  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post).subscribe((responseData) => {
      const id = responseData.postId;
      post.id = id;
      this.posts.push(post);
      this.postsUpdated.next([... this.posts]);
      this.router.navigate(['/']);
    });

  }

  updatePost(id:string, title:string, content:string){
    const post: Post ={ id:id,title:title,content:content};
    this.http.put('http://localhost:3000/api/posts/'+id,post).subscribe(() => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);

    });
  }

  deletePost(postId:string){
    this.http.delete('http://localhost:3000/api/posts/' + postId)
    .subscribe(() => {
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    });
  }

}
