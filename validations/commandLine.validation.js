import joi from "joi";

export default function commandLineValidation(body){
    const commandLineCreate = joi.object({
      ref: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
      command: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
      quantity: joi.number()
    })

    const commandLineUpdate = joi.object({
      quantity: joi.number()
    })

    return {
        commandLineCreate: commandLineCreate.validate(body),
        commandLineUpdate: commandLineUpdate.validate(body),
    }
}
