import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EmailModule } from './email/email.module'

/** Module gốc của email-service, đăng ký ConfigModule global và module email */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    EmailModule,
  ],
})
export class AppModule {}
