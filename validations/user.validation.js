import joi from "joi";

export default function userValidation(body){
    const userCreate = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
      isAdmin: joi.boolean(),
      firstname: joi.string().required(),
      lastname: joi.string().required(),
      address: joi.string().required(),
      town: joi.string().required(),
      zipcode: joi.string().pattern(/^[0-9]{5}$/).required(),
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
      email: joi.string().email(),
      password: joi.string(),
    })

    return {
        userCreate: userCreate.validate(body),
        userUpdate: userUpdate.validate(body),
        userLogin: userLogin.validate(body),
    }
}
