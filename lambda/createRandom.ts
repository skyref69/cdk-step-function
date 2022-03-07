interface InumRan {
    maxNumber: number,
    numberToCheck: number
}

//export const handler: number = async (event, context, callback)  => {    
export const createRandom = async(event: InumRan) => {
    return {
        "generatedRandomNumber": Math.floor(Math.random() * event.maxNumber) + 1,
        "maxNumber": event.maxNumber,
        "numberToCheck": event.numberToCheck    
    }
};

