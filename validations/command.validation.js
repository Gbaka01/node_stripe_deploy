import joi from "joi";

export default function commandValidation(body){
    const commandCreate = joi.object({
      status: joi.boolean().required(),
      user: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    })

    const commandUpdate = joi.object({
      status: joi.boolean(),
      user: joi.string().regex(/^[0-9a-fA-F]{24}$/),
      url: joi.string()
    })

    return {
        commandCreate: commandCreate.validate(body),
        commandUpdate: commandUpdate.validate(body),
    }
}
