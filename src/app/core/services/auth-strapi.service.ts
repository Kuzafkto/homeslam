import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom, map, tap, switchMap, catchError } from 'rxjs';
import { UserCredentials } from '../interfaces/user-credentials';
import { UserRegisterInfo } from '../interfaces/user-register-info';
import { JwtService } from './jwt.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { StrapiExtendedUser, StrapiLoginPayload, StrapiLoginResponse, StrapiRegisterPayload, StrapiRegisterResponse, StrapiUser } from '../interfaces/strapi';
import { User } from '../interfaces/user';

export class TypeNotValidException extends Error {
  // . declare any additional properties or methods .
}
@Injectable({ providedIn: 'root' })
export class AuthStrapiService extends AuthService {


  constructor(
    private jwtSvc: JwtService,
    private apiSvc: ApiService
  ) {
    super();
    this.init();
  }

  private init() {
    this.jwtSvc.loadToken().subscribe(
      {
        next: (logged) => {
          this._logged.next(logged != '');
        },
        error: (err) => {
          console.log("No hay token");
        }
      }
    );
  }

  public login(credentials: UserCredentials): Observable<void> {
    return new Observable<void>(obs => {
      const _credentials: StrapiLoginPayload = {
        identifier: credentials.username,
        password: credentials.password
      };
      this.apiSvc.post("/auth/local", _credentials).subscribe({
        next: async (data: StrapiLoginResponse) => {
          await lastValueFrom(this.jwtSvc.saveToken(data.jwt));
          this._logged.next(data && data.jwt != '');
          obs.next();
          obs.complete();
        },
        error: err => {
          obs.error(err);
        }
      });
    });
  }

  logout(): Observable<void> {
    return this.jwtSvc.destroyToken().pipe(map(_ => {
      this._logged.next(false);
      return;
    }));
  }

  register(info: UserRegisterInfo): Observable<void> {
    return new Observable<void>(obs => {
      const _info: StrapiRegisterPayload = {
        email: info.email,
        username: info.nickname,
        password: info.password
      }
      this.apiSvc.post("/auth/local/register", _info).subscribe({
        next: async (data: StrapiRegisterResponse) => {
          await lastValueFrom(this.jwtSvc.saveToken(data.jwt));
          this._logged.next(data && data.jwt != '');
          const _extended_user: StrapiExtendedUser = {
            data: {
              name: info.name,
              surname: info.surname,
              users_permissions_user: data.user.id,
              players: [],
              teams: [],
              trainers: []
            }
          }
          await lastValueFrom(this.apiSvc.post("/extended-users", _extended_user)).catch;
          obs.next();
          obs.complete();
        },
        error: err => {
          obs.error(err);
        }
      });
    });
  }

  //ADMINISTRACION DE USUARIOS

  public me(): Observable<any> {
    //obtiene el users me ,lo encadenamos con un pipe y hacemos un switchmap para mapear el valor del observable obteniendo el extended que también mapearemos
    return this.apiSvc.get('/users/me').pipe(
      switchMap((user: StrapiUser) => {
        // Realiza la segunda llamada a la api y le hacemos un pipe, dentro un Map
        return this.apiSvc.get(`/extended-users?filters[users_permissions_user]=${user.id}&populate=players&populate=teams&populate=trainers`).pipe(
          map(extended_user_response => {
            //para simplificar el mapeo creamos extended_user que es el contenido dentro de la posicion 0 del array response.data
            let extended_user = extended_user_response.data[0];
            //ahora para cada tipo de valor que tiene el extended user que está contenido dentro de un array (players,teams, y trainers) hacemos un condicional en el que si existe lo mapeamos con su id, de lo contrario tenemos un array vacio

            //lo hacemos con players
            let players = extended_user.attributes.players ? extended_user.attributes.players.data.map((p: any) => p.id) : [];
            //teams
            let teams = extended_user.attributes.teams ? extended_user.attributes.teams.data.map((t: any) => t.id) : [];
            //y trainers
            let trainers = extended_user.attributes.trainers ? extended_user.attributes.trainers.data.map((t: any) => t.id) : [];

            // Construye el objeto 'ret' con la información combinada
            let ret: any = {
              id: extended_user.id,
              name: extended_user.attributes.name,
              surname: extended_user.attributes.surname,
              username: user.username,
              users_permissions_user: user.id,
              email: user.email,
              players: players,
              teams: teams,
              trainers: trainers
            };
            //devolvemos el objeto con toda la informacion combinada
            return ret;
          })
        );
      }),
    );
  }



  public update(user: any): Observable<StrapiUser> | Observable<StrapiExtendedUser> {

    // obtienes un any y se chequea si el usuario a actualizar es extended-user o user y dependiendo del tipo que sea se modifican unos valores u otros

    //primero chequeo si es extended
    if (<StrapiExtendedUser>user.data.users_permissions_user) {
      return this.me().pipe(//obtienes me y con los datos haz lo siguiente
        switchMap((extended: any) => {
          let ext_id = extended.id; //obtienes el id del extended user usando el me

          //ahora nos creamos un extended user con los datos traidos del user
          //pero a diferencia de que debería estar mapeado para los datos con los que se relaciona
          let extended_mapped = {
            data: {
              name: user.data.name,
              surname: user.data.surname,
              users_permissions_user: user.data.users_permissions_user,

              // para players,teams y trainers usamos la propiedad set de strapi
              // dentro del objeto (players,teams,trainers) hacemos un set y dentro ponemos la lista de jugadores,equipos o entrenadores 

              players: {
                set: user.data.players
              },
              teams: {
                set: user.data.teams
              },
              trainers: {
                set: user.data.trainers
              }
            }
          }

          return this.apiSvc.put(`/extended-users/${ext_id}`, extended_mapped); //haces un put del user extended usando el id guardado
        })
      );
    }

    // ahora chequeamos en caso de que se a un user
    else if (<StrapiUser>user.email) {
      return this.apiSvc.get('/users/me').pipe(
        switchMap((_user: StrapiUser) => {
          let user_id = _user.id;
          let user_mapped={
           username:user.username,
           email:user.email
          }
          return this.apiSvc.put(`/users/${user_id}`, user_mapped);
        })
      );
    } else {
      // si no toma a ninguno de los dos valores es que el tipo de dato ingresado en el update no es ninguno de los dos y por lo tanto debemos ingresar un error
      return new Observable<any>(observer => {
        observer.error(new TypeNotValidException());
      })
    }
  }
}
