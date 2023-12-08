import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { zip } from 'rxjs';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { PlayersService } from 'src/app/core/services/player.service';
import { Player } from 'src/app/core/interfaces/player';
import { PlayerDetailComponent } from 'src/app/shared/components/player-detail/player-detail.component';
import { AuthStrapiService } from 'src/app/core/services/auth-strapi.service';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
 
  public loading:boolean = false;
  constructor(
    private auth:AuthStrapiService
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
  }


}
