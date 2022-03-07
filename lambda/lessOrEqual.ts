interface InumRan {
    maxNumber: number
}

//export const handler: number = async (event, context, callback)  => {    
export const lessOrEqual = async(event: InumRan) => {
   
    return "Numero " + event.maxNumber + " minore o uguale grande"

};