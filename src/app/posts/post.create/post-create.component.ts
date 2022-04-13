import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['post-create.component.scss']
})
export class PostCreateComponent implements OnInit {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
   isLoading = false;

  private postId: string | undefined | null;
 post: Post = {id:'', title: '', content: ''};
  constructor(public postsService: PostService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData =>{
          this.post = {id: postData._id, title: postData.title, content: postData.content};
          this.isLoading = false;
        })


      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) return;
    this.isLoading = true;
    if(this.mode==='create')
    this.postsService.addPost(form.value.title, form.value.content);
    if(this.mode === 'edit' && this.postId)
    this.postsService.updatePost(this.postId,form.value.title, form.value.content);
    this.isLoading = false;
    form.resetForm();
  }
}
