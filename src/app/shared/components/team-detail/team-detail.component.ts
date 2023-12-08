
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { ModalController } from '@ionic/angular';
import { Player } from 'src/app/core/interfaces/player';
import { Team } from 'src/app/core/interfaces/team';
import { PlayersService } from 'src/app/core/services/player.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
})
export class TeamDetailComponent implements OnInit {

  form: FormGroup;
  mode: 'New' | 'Edit' = 'New'

  currentTeamPlayers = new Set<Player>();

  //para controlar el form
  initialPlayers = new Set<Player>();

  availablePlayers= new Set<Player>();

  /*selectedTrainers = new Set<number>();

  //para controlar el form
  initialSelectedTrainers = new Set<number>();*/
  name: string="";

  @Input() set team(_team: Team | null) {
    if (_team) {
      this.mode = 'Edit';
      this.form.controls['id'].setValue(_team.data.id);
      this.form.controls['name'].setValue(_team.data.name);

      this.currentTeamPlayers.clear(); //hay que vaciarlo
      //this.selectedTrainers.clear();

      _team.data.players.forEach(
        player => {
          //objeto de tipo player a base del get 
          //primero nos suscribimos y a la suscripcion haccemos el add
          this.playerSvc.getplayer(player.id).subscribe(playerData=>{
            this.currentTeamPlayers.add(playerData);
            this.initialPlayers.add(playerData);
          });
          //usa el get del playerService para añadir el player usando el id dentro de team
          (this.form.get('players') as FormArray).push(new FormControl(player));
        });

      /*_team.data.trainers.forEach(
        trainer => {
          this.selectedTrainers.add(trainer.id);
          (this.form.get('trainers') as FormArray).push(new FormControl(trainer.id));
        });

      this.initialSelectedTrainers = new Set(this.selectedTrainers);
      */
    }
  }
  constructor(
    private _modal: ModalController,
    private formBuilder: FormBuilder,
    private playerSvc: PlayersService,
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required]],
      players: this.formBuilder.array([]),
      //trainers: this.formBuilder.array([])
    })
  }

  ngOnInit() {
    this.playerSvc.getAll().subscribe(
      players => {
        let initialPlayersArray= Array.from(this.initialPlayers);
        players.forEach(player => {
          if(initialPlayersArray.some((p:Player)=> p.data.id===player.data.id)){
            this.removePlayer(player,this.availablePlayers);
          }else{
            this.availablePlayers.add(player);
          }
        });
      }
    );
    this.name=this.form.get('name')?.value;
  }


  drop(event: CdkDragDrop<number[]>) {
    const previousContainerData = Array.from(event.previousContainer.data);
    const currentContainerData = Array.from(event.container.data);
    console.log("previousContainerData: "+previousContainerData+"\ncurrentContainerData: "+currentContainerData);

    console.log("previous id: "+event.container.id +"\n actual id: "+ event.previousContainer.id);
    if (event.container.id === event.previousContainer.id) {
     
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const playerId = event.previousContainer.data[event.previousIndex];
  
      if (event.previousContainer.id === 'availablePlayersList') {
        // Jugador añadido al equipo
        this.playerSvc.getplayer(playerId).subscribe(player=>{
          this.currentTeamPlayers.add(player);
          this.removePlayer(player,this.availablePlayers);
          this.addToFormArray(player);
        });
      } else {
        const playerId = event.previousContainer.data[event.previousIndex];

        // Jugador removido del equipo
        this.playerSvc.getplayer(playerId).subscribe(player=>{
          this.removePlayer(player,this.currentTeamPlayers);
          this.availablePlayers.add(player);
          this.removeFromFormArray(playerId);
          //this.cdr.detectChanges();
        });

      }
    }
  }

private removePlayer(player:Player,set:Set<Player>){
  const playerIdToRemove = player.data.id; // El ID del jugador a eliminar

  // Encuentra el objeto Player específico en el conjunto que coincida con el ID
  const playerToRemove = Array.from(set).find(player => player.data.id === playerIdToRemove);
  
  if (playerToRemove) {
   set.delete(playerToRemove);
  }
}
//control del form 
  private removeFromFormArray(playerId: number) {
    const playersArray = this.form.get('players') as FormArray;
    const index = playersArray.controls.findIndex((player:any) => player.value.id === playerId);
    if (index !== -1) {
      playersArray.removeAt(index);
    }
  }


  private addToFormArray(playerId: Player) {
    const playersArray = this.form.get('players') as FormArray;
    playersArray.push(new FormControl(playerId));
  }
//control del form

//funciones get que convierten el set en arrays con los id para poder hacer el ngFor
  get availablePlayersArray(): number[] {
    let availableAsArray=Array.from(this.availablePlayers);
    let availablePlayersId:number[]=[];

    availableAsArray.forEach(player => {
      availablePlayersId.push(player.data.id);
    });

    return availablePlayersId;
  }

  get currentTeamPlayersArray():number[]{
    let currentTeamAsArray=Array.from(this.currentTeamPlayers);
    let currentTeamId:number[]=[];

    currentTeamAsArray.forEach(player => {
      currentTeamId.push(player.data.id);
    });

    return currentTeamId;
  }
//funciones get que convierten el set en arrays con los id para poder hacer el ngFor



  onCancel() {
    this._modal.dismiss(null, 'cancel');
  }

  onSubmit() {
    this._modal.dismiss(this.form.value, 'ok');
  }

  onDelete() {
    this._modal.dismiss(this.form.value, 'delete');
  }

  hasError(control: string, error: string): boolean {
    let errors = this.form.controls[control].errors;
    return errors != null && error in errors;

  }

  get isFormDirty(): boolean {
    return this.form.get('name')?.value!=this.name || !this.areSetsEqual(this.currentTeamPlayers, this.initialPlayers);
  }

  areSetsEqual(setA:Set<Player>, setB:Set<Player>) {
    //si los dos sets no tienen el mismo tamaño entonces no pueden ser iguales, return false
    if (setA.size !== setB.size) return false;
    //ahora chequeamos por cada item del setA, si el setB no lo tiene, return false
    for (let item of setA) {
      if (!setB.has(item)) {
        return false;
      }
    }
    //en caso de que no haya devuelto false, entonces son iguales y devuelve true
    return true;
  }
}
