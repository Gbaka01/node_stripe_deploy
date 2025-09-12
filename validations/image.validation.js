import joi from "joi";
export default function imageValidation(body){
    const imageCreate = joi.object({
      name: joi.string().required(),
      alt: joi.string().required(),
    
    })

    return {
        imageCreate: imageCreate.validate(body),
    }
}
