import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthStrapiService } from 'src/app/core/services/auth-strapi.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.scss'],
})
export class AppToolbarComponent  implements OnInit {

  constructor(
    private router:Router,
    private auth: AuthService,
    private strapi:AuthStrapiService
  ) { }
user=""
  ngOnInit(
    
  ) {
    this.strapi.me().subscribe(user=>{
      this.user=user.name;
    });
  }


  
  public goToPlayers(){
    this.router.navigate(['/players']);
  }
  public goToAbout(){
    this.router.navigate(['/about']);
  }
  public goToTeams(){
    this.router.navigate(['/teams']);

  }
  onLogout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
