import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Team } from 'src/app/core/interfaces/team';

@Component({
  selector: 'app-team-info',
  templateUrl: './team-info.component.html',
  styleUrls: ['./team-info.component.scss'],
})
export class TeamInfoComponent  implements OnInit {

  @Input() team:Team | null=null;
  @Output() onCardClicked:EventEmitter<void> = new EventEmitter<void>();
  @Output() onDeleteClicked:EventEmitter<void> = new EventEmitter<void>();
  

  constructor() { }

  ngOnInit() {}


  onCardClick(){
    this.onCardClicked.emit();
  }

  onDeleteClick(event:any){
    this.onDeleteClicked.emit();
    event.stopPropagation();
  }
}
