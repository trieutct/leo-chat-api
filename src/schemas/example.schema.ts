import * as Joi from 'joi'

/** Schema validate body cho ExampleDto */
export const exampleSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  age: Joi.number().integer().min(0).required(),
}).required()
