import * as Joi from 'joi'

/** Schema validate body cho CreateUserDto */
export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().email().required(),
}).required()
