interface IstateVote {
    stateVote: string,
}

//export const handler: number = async (event, context, callback)  => {    
export const closeVote = async(event: IstateVote) => {
   
    return "Vote CLOSED !!!"

};