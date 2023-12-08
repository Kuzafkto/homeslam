import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UserRegisterInfo } from '../../core/interfaces/user-register-info';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    private auth: AuthService,
  ) { }

  ngOnInit() {
  }

  onRegister(registerInfo: UserRegisterInfo) {
    this.auth.register(registerInfo).subscribe({
      next: data => {
      },
      error: err => {
        console.log(err);
      }
    });
  }
}
