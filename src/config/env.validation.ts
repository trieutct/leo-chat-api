import * as Joi from 'joi'

/**
 * Schema validate các biến môi trường khi app khởi động
 * App sẽ fail fast nếu thiếu/sai biến bắt buộc
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
})
