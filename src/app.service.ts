import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  /** Trả về chuỗi chào mặc định */
  getHello(): string {
    return 'Hello World!'
  }
}
