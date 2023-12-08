import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { Player } from 'src/app/core/interfaces/player';
import { AuthService } from 'src/app/core/services/auth.service';
import { PlayersService } from 'src/app/core/services/player.service';
import { PlayerDetailComponent } from 'src/app/shared/components/player-detail/player-detail.component';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage implements OnInit {
 
  public loading:boolean = false;
  constructor(
    private router:Router,
    private toast:ToastController,
    public players:PlayersService,
    private modal:ModalController,
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.players.getAll().subscribe(results=>{
      this.loading = false;
    });
  }

  public welcome(){
    this.router.navigate(['/welcome']);
  }


  

  public onDeleteClicked(player:Player){
    var _player:Player = {...player};

    this.players.deleteplayer(_player).subscribe(
        {next: player=>{
        //Notificamos con un Toast que se ha pulsado
        const options:ToastOptions = {
          message:`player deleted`, //mensaje del toast
          duration:1000, // 1 segundo
          position:'bottom', // el toast se situa en la parte inferior
          color:'danger', // color del toast
          cssClass:'fav-ion-toast' //Una clase que podemos poner en global.scss para configurar el ion-toast
        };
        //creamos el toast
        this.toast.create(options).then(toast=>toast.present());
        },
        error: err=>{
          console.log(err);
        }
      });
  }

  public async onCardClicked(player:Player){
    
    var onDismiss = (info:any)=>{
      switch(info.role){
        case 'ok':{
          this.players.updateplayer(info).subscribe(async player=>{
              const options:ToastOptions = {
              message:"player modified",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
          })
        }
        break;
        case 'delete':{
          this.players.deleteplayer(info.data).subscribe(async player=>{
            const options:ToastOptions = {
            message:"player deleted",
            duration:1000,
            position:'bottom',
            color:'tertiary',
            cssClass:'card-ion-toast'
          };
          const toast = await this.toast.create(options);
          toast.present();
        })
        }
        break;
        default:{
          console.error("No debería entrar");
        }
      }
    }
    this.presentForm(player, onDismiss);
  }

  
  async presentForm(data:Player|null, onDismiss:(result:any)=>void){
    
    const modal = await this.modal.create({
      component:PlayerDetailComponent,
      componentProps:{
        player:data
      },
      cssClass:"fullModal"
    });
    modal.present();
    modal.onDidDismiss().then(result=>{
      if(result && result.data){
        onDismiss(result);
      }
    });
  }

  onNewplayer(){
    var onDismiss = (info:any)=>{
      switch(info.role){
        case 'ok':{
          this.players.addplayer(info).subscribe(async player=>{
              const options:ToastOptions = {
              message:"player created",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            this.players.getAll().subscribe();
          })
        }
        break;
        default:{
          console.error("No debería entrar");
        }
      }
    }
    this.presentForm(null, onDismiss);
  }
  
 

}
