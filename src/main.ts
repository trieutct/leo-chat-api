import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AppDefault, ConfigKey } from './common/constants'

/** Khởi tạo Nest app: gắn security header, prefix, validation, interceptor, exception filter rồi lắng nghe port */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const port = configService.get<number>(ConfigKey.PORT) ?? AppDefault.PORT

  // helmet gắn các security header mặc định (CSP, HSTS, X-Frame-Options...)
  app.use(helmet())
  app.setGlobalPrefix('api')
  // whitelist: loại field không khai báo trong DTO; transform: tự convert payload sang instance DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(port)
}
void bootstrap()
