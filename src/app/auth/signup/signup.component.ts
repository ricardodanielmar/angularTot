import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  isLoading = false;
  passwordsMatching = true;
  constructor(public authService: AuthService) { }

  ngOnInit(): void {
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
    this.authService.createUser(form.value.email, form.value.password);
  }

}
