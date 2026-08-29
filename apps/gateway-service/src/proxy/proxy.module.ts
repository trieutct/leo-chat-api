import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserServiceProxyMiddleware } from './proxy.middleware'

/** Module cấu hình proxy: forward request theo prefix path sang đúng service phía sau gateway */
@Module({
  imports: [ConfigModule],
})
export class ProxyModule implements NestModule {
  /** Đăng ký middleware proxy cho từng nhóm route, apply trước khi request chạm tới controller */
  configure(consumer: MiddlewareConsumer) {
    // /api/users/* -> user-service. Gateway không dùng setGlobalPrefix nên khai báo full path 'api/users' ở đây
    consumer.apply(UserServiceProxyMiddleware).forRoutes('api/users')

    // /api/emails/* -> email-service: CHƯA khả dụng vì email-service hiện là pure microservice
    // (chỉ lắng nghe RabbitMQ, không có HTTP port). Khi nào email-service mở HTTP listener,
    // thêm EmailServiceProxyMiddleware tương tự UserServiceProxyMiddleware rồi forRoutes('api/emails') ở đây.
  }
}
