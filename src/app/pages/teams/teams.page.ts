import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { Team } from 'src/app/core/interfaces/team';
import { TeamService } from 'src/app/core/services/team.service';
import { TeamDetailComponent } from 'src/app/shared/components/team-detail/team-detail.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.page.html',
  styleUrls: ['./teams.page.scss'],
})
export class TeamsPage implements OnInit {


  
  constructor(
    public teams:TeamService,
    private toast:ToastController,
    private modal:ModalController
  ) { }

  ngOnInit() {
    this.teams.getAll().subscribe(results=>{
    });
  }

  onNewteam() {

    var onDismiss = (info:any)=>{
      switch(info.role){
        case 'ok':{
          this.teams.addTeam(info).subscribe(async player=>{
              const options:ToastOptions = {
              message:"team created",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            this.teams.getAll().subscribe();
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

  public async onCardClicked(team:Team){
    
    var onDismiss = (info:any)=>{
      switch(info.role){
        case 'ok':{
          this.teams.updateTeam(info).subscribe(async team=>{
              const options:ToastOptions = {
              message:"team modified",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            this.teams.getAll().subscribe();
          })
        }
        break;
        case 'delete':{
          this.teams.deleteTeam(info.data).subscribe(async team=>{
            const options:ToastOptions = {
            message:"team deleted",
            duration:1000,
            position:'bottom',
            color:'tertiary',
            cssClass:'card-ion-toast'
          };
          const toast = await this.toast.create(options);
          toast.present();
          this.teams.getAll().subscribe();
        })
        }
        break;
        default:{
          console.error("No debería entrar");
        }
      }
    }
    this.presentForm(team, onDismiss);
  }


  public onDeleteClicked(team:Team){
    var _team:Team = {...team};

    this.teams.deleteTeam(_team).subscribe(
        {next: team=>{
        //Notificamos con un Toast que se ha pulsado
        const options:ToastOptions = {
          message:`Team deleted`, //mensaje del toast
          duration:1000, // 1 segundo
          position:'bottom', // el toast se situa en la parte inferior
          color:'danger', // color del toast
          cssClass:'fav-ion-toast' //Una clase que podemos poner en global.scss para configurar el ion-toast
        };
        //creamos el toast
        this.toast.create(options).then(toast=>toast.present());
        this.teams.getAll().subscribe();
      },
        error: err=>{
          console.log(err);
        }
      });
  }

  async presentForm(data:Team|null, onDismiss:(result:any)=>void){
    
    const modal = await this.modal.create({
      component:TeamDetailComponent,
      componentProps:{
        team:data
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
}
