interface IstateVote {
    stateVote: string,
}

export const stateVote = async(event: IstateVote) => {
    return {        
        "stateVote": event.stateVote  
    }
};

