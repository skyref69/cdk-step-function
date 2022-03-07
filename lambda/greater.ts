interface InumRan {
    maxNumber: number
}

//export const handler: number = async (event, context, callback)  => {    
export const greater = async(event: InumRan) => {
   
    return "Numero " + event.maxNumber + " troppo grande"

};