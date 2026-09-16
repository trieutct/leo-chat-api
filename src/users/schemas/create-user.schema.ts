import * as Joi from 'joi'

/** Schema validate body tạo mới user */
export const createUserSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  name: Joi.string().trim().min(1).optional(),
}).required()
