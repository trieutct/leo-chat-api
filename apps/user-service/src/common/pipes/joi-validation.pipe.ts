import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import type { ObjectSchema } from 'joi'

/** Validate request body theo Joi schema, ném BadRequestException khi dữ liệu không hợp lệ */
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Chỉ validate body, các loại param khác (query, param...) đi qua nguyên trạng
    if (metadata.type !== 'body') {
      return value
    }

    // abortEarly: false để trả về đủ tất cả lỗi field, không dừng ở lỗi đầu tiên
    // stripUnknown để loại field không khai báo trong schema
    const { error, value: validated } = this.schema.validate(value, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      throw new BadRequestException({
        message: 'Dữ liệu không hợp lệ',
        errors: error.details.map(detail => ({
          key: detail.path.join('.'),
          message: detail.message,
        })),
      })
    }

    return validated
  }
}
