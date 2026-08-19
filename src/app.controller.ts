import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { ExampleDto } from './dto/example.dto'
import { exampleSchema } from './schemas/example.schema'
import { JoiValidationPipe } from './common/pipes/joi-validation.pipe'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Trả về câu chào mặc định, dùng để kiểm tra API đã chạy */
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  /** Nhận body mẫu đã validate bằng Joi, minh hoạ luồng validate + trả lỗi chuẩn */
  @Post('example')
  createExample(
    @Body(new JoiValidationPipe(exampleSchema)) dto: ExampleDto,
  ): ExampleDto {
    return this.appService.createExample(dto)
  }
}
