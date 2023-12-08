import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UserCredentials } from 'src/app/core/interfaces/user-credentials';
import { UserRegisterInfo } from 'src/app/core/interfaces/user-register-info';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoginFormComponent } from 'src/app/shared/components/login-form/login-form.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onLogin(credentials: UserCredentials) {
    this.auth.login(credentials).subscribe({
      next: data => {

      },
      error: err => {
        console.log(err);
      }
    });
  }

  goToRegisterPage() {
    this.router.navigate(['/register']);
  }

  
  
  
  /*intento fallido de hacer que el register con su form estén dentro de Login
  
  onRegister(registerInfo: UserRegisterInfo) {

    var onDismiss = (info: any) => {
      console.log(info)
      if (info.form.value) {
        this.auth.register(registerInfo).subscribe({
          next: data => {
            console.log("Enviado")
          },  
          error: err => {
            console.log(err);
          }
        })
      }
    }
    console.log("Register formm");
    this.presentForm(onDismiss);

  }


  async presentForm(onDismiss: (result: any) => void) {

    const modal = await this.modal.create({
      component: LoginFormComponent,
      cssClass: "modal-full-right-side"
    }
    );
    modal.present();
    modal.onDidDismiss().then(result => {
      if (result && result.data) {
        onDismiss(result);
      }
    });

  }
*/

}
