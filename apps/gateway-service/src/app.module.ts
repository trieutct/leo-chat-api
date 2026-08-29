import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProxyModule } from './proxy/proxy.module'

/** Module gốc của gateway-service, đăng ký ConfigModule global và module proxy */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ProxyModule,
  ],
})
export class AppModule {}
