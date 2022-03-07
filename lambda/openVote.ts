interface IstateVote {
    stateVote: string,
}

//export const handler: number = async (event, context, callback)  => {    
export const openVote = async(event: IstateVote) => {
   
    return "Vote OPEN !!!"

};