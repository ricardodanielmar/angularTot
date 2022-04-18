import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['post-create.component.scss']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  isLoading = false;
  form: FormGroup | undefined;
  imagePreview: string | undefined | null;
  private postId: string | undefined | null;
  private authStatusSub: Subscription = new Subscription();
  post: Post = { id: '', title: '', content: '', imagePath: null, creator: '' };
  constructor(public postsService: PostService, public route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.post = { id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath, creator: postData.creator };
          this.isLoading = false;
          this.form?.setValue({ title: this.post.title, content: this.post.content, image: this.post.imagePath });
          this.imagePreview = this.post.imagePath;
        })


      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.form?.controls['image'].patchValue(file);
    this.form?.controls['image'].updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result?.toString();
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form?.invalid) return;
    this.isLoading = true;
    if (this.mode === 'create')
      this.postsService.addPost(this.form?.value.title, this.form?.value.content, this.form?.value.image);
    if (this.mode === 'edit' && this.postId)
      this.postsService.updatePost(this.postId, this.form?.value.title, this.form?.value.content, this.form?.value.image);
    this.isLoading = false;
    this.form?.reset();
  }

  ngOnDestroy(): void {
      this.authStatusSub.unsubscribe();
  }
}
