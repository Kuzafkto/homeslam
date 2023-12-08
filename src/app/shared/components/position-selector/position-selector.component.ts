import { ForwardRefHandling } from '@angular/compiler';
import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Position } from 'src/app/core/interfaces/player';

@Component({
  selector: 'app-position-selector',
  templateUrl: './position-selector.component.html',
  styleUrls: ['./position-selector.component.scss'],
  providers:[
    {
      provide:NG_VALUE_ACCESSOR,
      useExisting:forwardRef(()=>PositionSelectorComponent),
      multi:true
    }
  ]
})
export class PositionSelectorComponent implements ControlValueAccessor{

  @Input() inputPositions:Set<number>=new Set<number>();
  @Output() positionsChange = new EventEmitter<Set<number>>();

  positionsSelected:number[]=Array.from(this.inputPositions);
  setChecker:Set<number>=this.inputPositions;
onChangeCb?:(position:Position)=>void;
onTouchedCb?:()=>void;
  allPositions:Position[]=[
    { id: 1, name: 'pitcher' },
    { id: 2, name: 'catcher' },
    { id: 3, name: 'first base' },
    { id: 4, name: 'second base' },
    { id: 5, name: 'third base' },
    { id: 6, name: 'shortstop' },
    { id: 7, name: 'left field' },
    { id: 8, name: 'center field' },
    { id: 9, name: 'right field' },
    { id: 10, name: 'designated hitter' }
  ];
  constructor(private renderer: Renderer2, private el: ElementRef) { }

  
  addPosition(position:Position):void{
    this.setChecker.clear();
    const index = this.positionsSelected.indexOf(position.id);
    if (index > -1) {
      this.positionsSelected.splice(index, 1);
    }else{
      if(this.positionsSelected?.length<3){
        this.positionsSelected.push(position.id);
      }else{
        this.positionsSelected.splice(0,1);
        //this.positionsSelected.pop();
        this.positionsSelected.push(position.id);        
      }
    }
    this.positionsSelected.forEach(pos => {
      this.setChecker.add(pos);
    });
    this.positionsChange.emit(this.setChecker);
    this.onChangeCb && this.onChangeCb(position);
  }

  writeValue(positions: number[]): void {
    this.positionsSelected=positions;
  }
  registerOnChange(fn: any): void {
    this.onChangeCb=fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCb=fn;
  }


}
