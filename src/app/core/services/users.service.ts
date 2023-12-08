import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, mergeMap, switchMap } from 'rxjs';
import { User } from 'src/app/core/interfaces/user';
import { environment } from 'src/environments/environment';
import { StrapiExtendedUser } from '../interfaces/strapi';
import { ApiService } from './api.service';



export class UserNotFoundException extends Error {
  // . declare any additional properties or methods .
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  id:number=0;
  private _users:BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public users$:Observable<User[]> = this._users.asObservable();
  
  constructor(
    private api:ApiService
  ) { 

  }

  public addUser(user:User):Observable<User>{
    var _user:any = {
      name: user.name,
      surname: user.surname,
    }
   
    return this.api.post(environment.apiUrl+"/users",_user).pipe(tap(_=>{
      this.getAll().subscribe();
    }))
    /*
    return new Observable<User>(observer=>{
      setTimeout(() => {
        var _users = [...this._users.value];
        user.id = ++this.id;
        _users.push(user);
        this._users.next(_users);
        observer.next(user);
      }, 1000);
    })
    */
  }

  public query(q:string):Observable<User[]>{
    // Si coincide el tipo de datos que recibo con mi interfaz
    return this.api.get(environment.apiJsonServer+'/api/extended-users?q='+q);
  }

  public getAll(): Observable<User[]> {
    return this.api.get('/users').pipe(map((users: any[]) => {
      const transformedUsers: User[] = [];
  
      users.forEach((user: any) => {
        transformedUsers.push({
          id: user.id,
          name: user.username,
          surname: user.email,
        });
      });
      this._users.next(transformedUsers);
      //debes devolver un observable 
      return transformedUsers;
    }));
  }
  
    /*
    //Si tenemos que hacer un mapeo
    return this.http.get<User[]>(environment.apiJsonServer+'/users').pipe(map((users:any[])=>{
      return users.map((_user:any)=>{
        return {
          id:_user.id,
          name: _user.name,
          surname: _user.surname,
          age: _user.age
        }
      }
    )}));
    */
    /*
    return new Observable(observer=>{
      setTimeout(() => {
        var users:User[] = [
          {id: 1, name:"Juan A.", surname:"garcía gómez", age:46, fav:true},
          {id: 2, name:"Alejandro", surname:"garcía gómez", age:45, fav:true},
          {id: 3, name:"juan", surname:"garcía Valencia", age:4, fav:false},
          {id: 4, name:"María del Mar", surname:"Valencia Valencia", age:46, fav:true},
          {id: 5, name:"Lydia", surname:"garcía Robles", age:11, fav:false}
        ];
        this.id=5;
        this._users.next(users);
        observer.next(users);
        observer.complete();  
      }, 1000);
      
    });
    */
  
  public getUser(id:number):Observable<User>{
    return this.api.get(environment.apiUrl+`/users/${id}`);
    /*
    return new Observable(observer=>{
      setTimeout(() => {
        var user = this._users.value.find(user=>user.id==id);
        if(user)
          observer.next(user);
        else 
          observer.error(new UserNotFoundException());
        observer.complete();
      }, 1000);
      
    })
    */
    
  }

  public updateUser(user:any,id:number):Observable<User>{
    //metes un user y lo actualizas a el mismo user y extended User con los datos del user ingresado
              return this.api.get(`/extended-users?filters[users_permissions_user]=${id}`).pipe(
                switchMap((extended_user:any)=>{
                  var extended_id=extended_user.id;
                  var extended_user:any={
                    data:{
                      name:user.name,
                      surname:user.surname,
                      users_permissions_user:extended_user.data.users_permissions_user,
                      players:extended_user.data.players,
                      teams:extended_user.data.teams,
                      trainers:extended_user.data.trainers,
                    }
                  }
                  return this.api.put(`/extended-users/${extended_id}`,)
                })
              )
                //post del user + post del extended
              
    /*
    return new Observable(observer=>{
      setTimeout(() => {
        var _users = [...this._users.value];
        var index = _users.findIndex(u=>u.id==user.id);
        if(index<0)
          observer.error(new UserNotFoundException());
        else{
          _users[index]=user;
          observer.next(user);
          this._users.next(_users);
        }
        observer.complete();
      }, 500);
      
    });
    */
  }


  public deleteUser(user:User):Observable<User>{
    return new Observable<User>(obs=>{
      this.api.delete(environment.apiJsonServer+`/users/${user.id}`).subscribe(_=>{
          this.getAll().subscribe(_=>{
            obs.next(user);
          })})});
    
    /*
    return new Observable(observer=>{
      setTimeout(() => {
        var _users = [...this._users.value];
        var index = _users.findIndex(u=>u.id==user.id);
        if(index<0)
          observer.error(new UserNotFoundException());
        else{
          _users = [..._users.slice(0,index),..._users.slice(index+1)];
          this._users.next(_users);
          observer.next(user);
        }
        observer.complete();
      }, 500);
      
    });
    */
  }

  public deleteAll():Observable<void>{
    return new Observable(observer=>{
      setTimeout(() => {
        this._users.next([]);
        observer.next();
        observer.complete();  
      }, 1000);
    });
  }
}
