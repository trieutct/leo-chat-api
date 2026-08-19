import { Injectable } from '@nestjs/common'
import { ExampleDto } from './dto/example.dto'

@Injectable()
export class AppService {
  /** Trả về chuỗi chào mặc định */
  getHello(): string {
    return 'Hello World!'
  }

  /** Xử lý dữ liệu mẫu đã qua validate, dùng để test luồng JoiValidationPipe */
  createExample(dto: ExampleDto): ExampleDto {
    return dto
  }
}
