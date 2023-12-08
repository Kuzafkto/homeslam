import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { RouterModule } from '@angular/router';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { HttpClient } from '@angular/common/http';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { PlayerInfoComponent } from './components/player-info/player-info.component';
import { PlayerDetailComponent } from './components/player-detail/player-detail.component';
import { PictureSelectableComponent } from './components/picture-selectable/picture-selectable.component';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';
import { TeamInfoComponent } from './components/team-info/team-info.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppToolbarComponent } from './components/app-toolbar/app-toolbar.component';
import { PositionSelectorComponent } from './components/position-selector/position-selector.component';
import { NamePipe } from './pipes/name.pipe';
import { PositionImageDirective } from './directives/position-image.directive';



@NgModule({
  declarations: [
    //Directifes
    //Pipes
    //Components
    UserInfoComponent,
    UserDetailComponent,
    PlayerDetailComponent,
    LoginFormComponent,
    PlayerInfoComponent,
    PictureSelectableComponent,
    TeamDetailComponent,
    TeamInfoComponent,
    AppToolbarComponent,
    PositionSelectorComponent,
      RegisterFormComponent,
      NamePipe,
      PositionImageDirective,
      
      
      ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    
  ],
  exports:[
    CommonModule, 
    IonicModule, 
    FormsModule,
    //Directifes
    //Pipes
    //Components
    UserInfoComponent,
    PlayerDetailComponent,
    UserDetailComponent,
    LoginFormComponent,
    RegisterFormComponent,
    PictureSelectableComponent,
    PlayerInfoComponent,
    TeamDetailComponent,
    TeamInfoComponent,
    AppToolbarComponent,
    PositionSelectorComponent,
    PositionImageDirective
  ]
})
export class SharedModule { }
