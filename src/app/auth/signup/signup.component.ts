import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  isLoading = false;
  passwordsMatching = true;
  private authStatusSub:Subscription = new Subscription();
  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus=>{this.isLoading = false});
  }

  onSignup(form: NgForm) {
    if (form.value.password !== form.value.passwordRepeated) {
      this.passwordsMatching = false;

    } else {
      this.passwordsMatching = true;
    }
    if (form.invalid || !this.passwordsMatching) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();

  }

}
