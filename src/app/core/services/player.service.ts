import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom, map, tap, switchMap } from 'rxjs';
import { Player } from '../interfaces/player';
import { StrapiUser } from '../interfaces/strapi';
import { ApiService } from './api.service';
import { AuthStrapiService } from './auth-strapi.service';



export class playerNotFoundException extends Error {
  // . declare any additional properties or methods .
}

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  private _players: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public players$: Observable<Player[]> = this._players.asObservable();

  constructor(
    private api: ApiService,
    private auth: AuthStrapiService
  ) {

  }

  public addplayer(player: Player): Observable<Player> {
        //tenemos que mapear el player que llega para implementar la funcion set
          let player_mapped = {
            data: {
              name: player.data.name,
              surname: player.data.surname,
              age: player.data.age,
              positions: {
                set: player.data.positions //set establece la relacion del player con las positions indicando los id de la tabla position que tiene el array positions de player
              }
            }
          };
          //hacemos un post en la tabla players con el player mapeado y hacemos switchmap para trabajar con el player creado
         return this.api.post(`/players/`, player_mapped).pipe(switchMap(createdPlayer => 
           {
            //extraemos el id del player al que le acabamos de hacer post para poder añadir el id de ese player a la lista de players que tiene el extended-user
            let id=createdPlayer.data.id;
           
            //ahora utilizando pipe usamos el me de auth strapi service para extraer toda la info de ese user y así poder actualizar el valor de los jugadores que le pertenecen a ese usuario
            return this.auth.me().pipe(
         switchMap(userInfo => {
            let extended= {
              data: {
                ...userInfo,//metemos una copia de los datos de userInfo
                players:[...userInfo.players,id]
                  //aca hay que hacer un get con el id del player nuevo creado porque player.data no tiene el id, sino todos los datos para hacer el post
                
              }
            };
            //actualizamos el extended-user con el id del user y el player metido en la lista de players
            //nota: aca deberíamos usar el udpate de auth-strapi 
            return this.auth.update(extended);
          }),
          //por último, como el update devuelve un observable de tipo StrapiUser o StrapiExtendedUser y debemos devolver un observable de tipo player. Mapeamos el valor que devuelve _ a el player que ingresamos como parámetro, devolviendo el player ingresado al principio de la función
          map(_ => player)
            );
        }),
         );
    }

  public query(q: string): Observable<Player[]> {
    // Si coincide el tipo de datos que recibo con mi interfaz
    //note: falta hacer el populate con positions y el mapeo antes de devolverlo?
    return this.api.get('/api/extended-players?q=' + q);
  }

  public getAll(): Observable<Player[]> {
    //necesito hacer un me y obtener en una variable el valor de players
    // luego hascer el get y a ese get hacerle un filter
    return this.auth.me().pipe(
      switchMap(res =>{
        //de el extended user obtenemos los players que le pertenecen a ese usuario y lo meteremos dentro de un array que usaremos como filtro
        let players_filter=res.players;

        return this.api.get('/players?populate=positions').pipe(
          map(response => {
            let players = response.data; //crearemos un array que contendrá el data del get de todos los players junto a sus posiciones.

            // Crearemos un array llamado players_filtered que guardará los player filtrados
            let players_filtered:any[]=[];

            // Creamos el array que usaremos como return final, a este mismo si contiene algun player se le hará un mapeo con sus respectivas posiciones.
            let transformedPlayers:Player[]=[];

            // filtramos los players mediante el id
            // si la longitud del array es mayor a 0
            if(players_filter.length>0){
              players.forEach((player:any) => {
                //chequea si dentro de players_filter está player.id, el triple igual es para comprobar que también sean del mismo tipo
                //nota: some chequea si al menos un elemento en el array cumple la condicion
                if(players_filter.some((p:any) =>p===player.id)){
                  players_filtered.push(player);
                }
              });

              //asignamos a transformedPlayers el array con los players ya filtrados pero mapeados
              transformedPlayers = players_filtered.map((player: any) => {
                //mapeamos las posiciones con su respectivo id y nombre de la posición
                let positions = player.attributes.positions.data.map((position: any) => {
                  return {
                    id: position.id,
                    name: position.attributes.name
                  };
                });
                //ahora retornamos el player mapeado con su data y además las posiciones usando la variable positions
                  return {
                    data: {
                      id: player.id,
                      name: player.attributes.name,
                      surname: player.attributes.surname,
                      age: player.attributes.age,
                      positions: positions
                    }
                  }
            });
            // le hacemos un next al behaviour subject con el array de transformedPlayers
            this._players.next(transformedPlayers);
            }
            // devolvemos el array de players filtrado y mapeado correctamente
            return transformedPlayers;
          }),
        );
      }),
    )
    
  }


  /*
  //Si tenemos que hacer un mapeo
  return this.api.get<player[]>(environment.apiJsonServer+'/players').pipe(map((players:any[])=>{
    return players.map((_player:any)=>{
      return {
        id:_player.id,
        name: _player.name,
        surname: _player.surname,
        age: _player.age
      }
    }
  )}));
  */
  /*
  return new Observable(observer=>{
    setTimeout(() => {
      var players:player[] = [
        {id: 1, name:"Juan A.", surname:"garcía gómez", age:46, fav:true},
        {id: 2, name:"Alejandro", surname:"garcía gómez", age:45, fav:true},
        {id: 3, name:"juan", surname:"garcía Valencia", age:4, fav:false},
        {id: 4, name:"María del Mar", surname:"Valencia Valencia", age:46, fav:true},
        {id: 5, name:"Lydia", surname:"garcía Robles", age:11, fav:false}
      ];
      this.id=5;
      this._players.next(players);
      observer.next(players);
      observer.complete();  
    }, 1000);
    
  });
  */

  public getplayer(id: number): Observable<Player> {
    return this.api.get(`/players/${id}?populate=positions`).pipe(map(player =>{
      //esto es copiar y pegar parte del código de getAll para el mapeo del player
      let positions = player.data.attributes.positions.data.map((position: any) => {
        return {
          id: position.id,
          name: position.attributes.name
        };
      });
      return{
        data: {
          id: player.data.id,
          name: player.data.attributes.name,
          surname: player.data.attributes.surname,
          age: player.data.attributes.age,
          positions: positions
        }
      }
    })
    );
    /*
    return new Observable(observer=>{
      setTimeout(() => {
        var player = this._players.value.find(player=>player.id==id);
        if(player)
          observer.next(player);
        else 
          observer.error(new playerNotFoundException());
        observer.complete();
      }, 1000);
      
    })
    */

  }

  public updateplayer(player: Player): Observable<Player> {
    return new Observable<Player>(obs => {
      if (player.data && player.data.id) {
        let payload = {
          data: {
            name: player.data.name,
            surname: player.data.surname,
            age: player.data.age,
            positions: {
              set: player.data.positions
            }
          }
        };
        this.api.put(`/players/${player.data.id}`, payload).subscribe(_ => {
          this.getAll().subscribe(_ => {
            this.getplayer(player.data.id).subscribe(_player => {
              obs.next(_player);
            })
          })
        });
      } else {
        obs.error(new Error('Player data or ID is undefined'));
      }
    });

    /*
    return new Observable(observer=>{
      setTimeout(() => {
        var _players = [...this._players.value];
        var index = _players.findIndex(u=>u.id==player.id);
        if(index<0)
          observer.error(new playerNotFoundException());
        else{
          _players[index]=player;
          observer.next(player);
          this._players.next(_players);
        }
        observer.complete();
      }, 500);
      
    });
    */

  }

  public deleteplayer(player: Player): Observable<Player> {
    return new Observable<Player>(obs => {
      this.api.delete(`/players/${player.data.id}`).subscribe(_ => {
        this.getAll().subscribe(_ => {
          obs.next(player);
        })
      })
    });

    /*
    return new Observable(observer=>{
      setTimeout(() => {
        var _players = [...this._players.value];
        var index = _players.findIndex(u=>u.id==player.id);
        if(index<0)
          observer.error(new playerNotFoundException());
        else{
          _players = [..._players.slice(0,index),..._players.slice(index+1)];
          this._players.next(_players);
          observer.next(player);
        }
        observer.complete();
      }, 500);
      
    });
    */
  }

  public deleteAll(): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        this._players.next([]);
        observer.next();
        observer.complete();
      }, 1000);
    });
  }
}
