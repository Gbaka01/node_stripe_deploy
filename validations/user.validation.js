import joi from "joi";

export default function userValidation(body){
    const userCreate = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/).messages({
      "string.pattern.base":
        "Mot de passe invalide : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial.",
    }),
      isAdmin: joi.boolean(),
      firstname: joi.string().required(),
      lastname: joi.string().required(),
      address: joi.string().required(),
      town: joi.string().required(),
      zipcode: joi.string().min(2).max(10).required(),
      phone: joi.string(),
    })

    const userUpdate = joi.object({
      email: joi.string().email(),
      password: joi.string(),
      isAdmin: joi.boolean(),
      firstname: joi.string(),
      lastname: joi.string(),
      address: joi.string(),
      town: joi.string(),
      zipcode: joi.string().pattern(/^[0-9]{5}$/),
      phone: joi.string(),
    })

    const userLogin = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    })

    return {
        userCreate: userCreate.validate(body),
        userUpdate: userUpdate.validate(body),
        userLogin: userLogin.validate(body),
    }
}
