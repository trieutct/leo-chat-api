import * as Joi from 'joi'

/** Schema validate body cập nhật user, ít nhất phải có 1 field */
export const updateUserSchema = Joi.object({
  email: Joi.string().trim().email().optional(),
  name: Joi.string().trim().min(1).optional(),
})
  .min(1)
  .required()
