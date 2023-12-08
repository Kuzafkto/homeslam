export interface Team{
    data:{
        id:number,
        name:string,
        players:[
            {
                id:number,
                name:string
            }
        ],
        trainers:[
            {
                id:number,
                name:string
            }
        ]
    }
}