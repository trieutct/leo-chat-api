import { Injectable, Logger, type NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createProxyMiddleware, type RequestHandler } from 'http-proxy-middleware'
import type { NextFunction, Request, Response } from 'express'
import { AppDefault, ConfigKey } from '../common/constants'

/** Middleware forward toàn bộ request /api/users/* sang user-service, giữ nguyên method/header/body */
@Injectable()
export class UserServiceProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserServiceProxyMiddleware.name)
  private readonly proxy: RequestHandler

  constructor(private readonly configService: ConfigService) {
    const target =
      this.configService.get<string>(ConfigKey.USER_SERVICE_URL) ??
      AppDefault.USER_SERVICE_URL

    this.proxy = createProxyMiddleware({
      target,
      changeOrigin: true,
      // middleware mount qua forRoutes('api/users') -> Express tự strip prefix 'api/users'
      // khỏi req.url trước khi tới đây, phải rewrite lại path gốc thì user-service mới match được route
      pathRewrite: path => `/api/users${path}`,
      // log lỗi khi user-service không phản hồi (down, timeout...)
      on: {
        error: (error, _req, res) => {
          this.logger.error(`Proxy tới user-service thất bại: ${error.message}`)
          if ('writeHead' in res) {
            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(
              JSON.stringify({
                statusCode: 502,
                message: 'user-service không phản hồi, vui lòng thử lại',
              }),
            )
          }
        },
      },
    })
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.proxy(req, res, next)
  }
}
