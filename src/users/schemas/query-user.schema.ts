import * as Joi from 'joi'

/** Schema validate query string khi lấy danh sách user */
export const queryUserSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  keyword: Joi.string().trim().allow('').optional(),
})
