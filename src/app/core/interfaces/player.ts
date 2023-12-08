export interface Player{
    data:{
        id:number,
        name:string,
        surname:string,
        age:number,
        positions:[Position
        ]
        
    }
}
export interface Position{
    
        id:number,
        name:string
    
}