import joi from "joi";

export default function mangaValidation(body){
    const mangaCreate = joi.object({
      titre: joi.string().required(),
      description: joi.string(),
      prix: joi.number().required(),
      stock: joi.number(),
      tome: joi.number(),
      isbn: joi.number()
    })

    const mangaUpdate = joi.object({
      titre: joi.string(),
      description: joi.string(),
      prix: joi.number(),
      stock: joi.number(),
      tome: joi.number(),
      isbn: joi.number()
    })

    const mangaAddOrRemove = joi.object({
      images: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    })



    return {
        mangaCreate: mangaCreate.validate(body),
        mangaUpdate: mangaUpdate.validate(body),
        mangaAddOrRemove: mangaAddOrRemove.validate(body),
    }
}
