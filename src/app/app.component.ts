import { Component, OnDestroy } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{

  constructor(
    private auth:AuthService,
    private router:Router
  ) {
    this.auth.isLogged$.subscribe(logged=>{
      if(logged)
        this.router.navigate(['/home']);
    });
  }
}
