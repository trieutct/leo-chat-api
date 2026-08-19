import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Trả về câu chào mặc định, dùng để kiểm tra API đã chạy */
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
