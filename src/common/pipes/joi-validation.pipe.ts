import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import type { ObjectSchema } from 'joi'
import type { IErrorResponse } from 'src/utils/api.response'
import { HttpStatus } from 'src/common/constants'

/**
 * Validate request body theo Joi schema, ném BadRequestException với
 * errors[] (key = field lỗi) để HttpExceptionFilter trả về client theo format chuẩn
 */
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Chỉ validate body, các loại param khác (query, param...) đi qua nguyên trạng
    if (metadata.type !== 'body') {
      return value
    }

    // abortEarly: false để trả về đủ tất cả lỗi field, không dừng ở lỗi đầu tiên
    // stripUnknown để loại field không khai báo trong schema, giống whitelist của class-validator
    const { error, value: validated } = this.schema.validate(value, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      throw new BadRequestException({
        message: 'Dữ liệu không hợp lệ',
        errors: this.mapErrors(error),
      })
    }

    return validated
  }

  /** Convert Joi ValidationError sang IErrorResponse[], key lấy từ đường dẫn field lỗi */
  private mapErrors(error: {
    details: { path: (string | number)[]; message: string }[]
  }): IErrorResponse[] {
    return error.details.map(detail => ({
      key: detail.path.join('.'),
      error_code: HttpStatus.BAD_REQUEST,
      message: detail.message,
    }))
  }
}
