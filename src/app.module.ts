import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from './config/app.config'
import { envValidationSchema } from './config/env.validation'
import { PrismaModule } from './prisma/prisma.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

/** Module gốc của ứng dụng, đăng ký ConfigModule global và các module con */
@Module({
  imports: [
    // isGlobal để mọi module khác dùng ConfigService mà không cần import lại
    // validationSchema chặn app khởi động nếu thiếu/sai biến môi trường bắt buộc
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
