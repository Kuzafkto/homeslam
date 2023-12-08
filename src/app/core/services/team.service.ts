import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap, throwError } from 'rxjs';
import { Team } from '../interfaces/team';
import { ApiService } from './api.service';
import { AuthStrapiService } from './auth-strapi.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private _teams: BehaviorSubject<Team[]> = new BehaviorSubject<Team[]>([]);
  public teams$: Observable<Team[]> = this._teams.asObservable();

  constructor(
    private api: ApiService,
    private auth: AuthStrapiService
  ) { }

  public getteam(id: number): Observable<Team> {
    return this.api.get(`/teams/${id}?populate=players&populate=trainers`).pipe(map(team => {
      let players = team.data.attributes.players.data.map((player: any) => {
        return {
          id: player.id,
          name: player.attributes.name
        }
      });
      let trainers = team.data.attributes.trainers.data.map((trainer: any) => {
        return {
          id: trainer.id,
          name: trainer.attributes.name
        }
      })
      return {
        data: {
          id: team.data.id,
          name: team.data.attributes.name,
          players: players,
          trainers: trainers
        }
      }
    }))
  }

  public getAll(): Observable<Team[]> {
    //debemos de hacer un get de todos los teamss
    return this.auth.me().pipe(
      switchMap(res => {
        //de el extended user obtenemos los players que le pertenecen a ese usuario y lo meteremos dentro de un array que usaremos como filtro
       let teams_filter = res.teams;

        return this.api.get('/teams?populate=players&populate=trainers').pipe(
          map((response: any) => {
            let teams = response.data;

            let teams_filtered: any[] = [];

            let transformedTeams: Team[] = [];
            if (teams_filter.length > 0) {
              teams.forEach((team: any) => {
                if (teams_filter.some((t: any) => t === team.id)) {
                  teams_filtered.push(team);
                }
              });
              
              transformedTeams = teams_filtered.map((team: any) => {
                let players = team.attributes.players.data.map((player: any) => {
                  return {
                    id: player.id,
                    name: player.attributes.name,
                    age: player.attributes.age
                  };
                });

                let trainers = team.attributes.trainers.data.map((trainer: any) => {
                  return {
                    id: trainer.id,
                    name: trainer.attributes.name,
                  };
                });
                return {
                  data: {
                    id: team.id,
                    name: team.attributes.name,
                    players: players,
                    trainers: trainers
                  }
                }
              });
              transformedTeams.sort((a:Team, b:Team) => b.data.id - a.data.id);
              this._teams.next(transformedTeams);
            }
            return transformedTeams
          }),
        );
      }),
    )
  }

  public addTeam(team: Team): Observable<Team> {
    //test, falta mucho como añadir el team al extended user pero el post funciona
    let players = team.data.players.map((player: any) => {
      return {
        id: player.data.id
      };
    });
    let team_mapped = {
      data: {
        name: team.data.name,
        players: {
          set: players
        },
        trainers: {
          set: team.data.trainers
        }
      }
    }
    return this.api.post(`/teams/`, team_mapped).pipe(switchMap(createdTeam => {
      let id = createdTeam.data.id;

      return this.auth.me().pipe(
        switchMap(userInfo => {
          let extended = {
            data: {
              ...userInfo,
              teams: [...userInfo.teams, id]
            }
          };
          return this.auth.update(extended);
        }),
        map(_ => team)
      );
    }),);
  }

  public updateTeam(team: Team): Observable<Team> {
    if (!team.data || !team.data.id) {
      return throwError(() => new Error("Team data o id es undefined"))
    }
    let players:any[]=[];
    if(team.data.players){
      players = team.data.players.map((player: any) => {
        if(player.data){
          return{
            id:player.data.id
          }
        }else{
          return {
            id: player.id
          }
        }
       
      });
    }
    let trainers:any[]=[];
    if(team.data.trainers){
      trainers = team.data.trainers.map((trainer: any) => {
        return {
          id: trainer.id
        }
      });
    }

    
    let team_mapped = {
      data: {
        name: team.data.name,
        players: {
          set: players,//team.data.players
        },
        trainers: {
          set: trainers//team.data.trainers
        }
      }
    };
    return this.api.put(`/teams/${team.data.id}`, team_mapped).pipe(switchMap(() => this.getteam(team.data.id))
    );

  }

  public deleteTeam(team: Team): Observable<Team> {
    return new Observable<Team>(obs => {
      this.api.delete(`/teams/${team.data.id}`).subscribe(_ => {
        this.getAll().subscribe(_ => {
          obs.next(team);
        })
      })
    });
  }
}
