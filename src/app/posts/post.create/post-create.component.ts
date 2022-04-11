import { Component } from '@angular/core';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['post-create.component.scss']
})
export class PostCreateComponent {
  newPost = 'NO CONTENT';
  enteredValue = '';

  onAddPost() {
    this.newPost = this.enteredValue;
  }
}
