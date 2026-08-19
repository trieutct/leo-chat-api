import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import type { Response } from 'express'
import { HttpStatus } from 'src/common/constants'
import { ErrorResponse } from 'src/utils/api.response'
import type { IErrorResponse } from 'src/utils/api.response'

/**
 * Bắt toàn bộ lỗi (HttpException và lỗi không xác định) và trả về
 * response đồng nhất theo format { code, message, errors }
 * Không lộ chi tiết nội bộ (stack, query) ra client
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  /** Xử lý mọi exception ném ra trong request, trả response lỗi đồng nhất */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Chỉ HttpException mới có status/message rõ ràng, còn lại coi là lỗi hệ thống (500)
    const isHttpException = exception instanceof HttpException
    const code = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = isHttpException
      ? this.extractMessage(exception)
      : 'Đã có lỗi xảy ra, vui lòng thử lại sau'

    const errors: IErrorResponse[] = isHttpException
      ? this.extractErrors(exception)
      : []

    // Log đầy đủ (kèm stack nếu là lỗi không xác định) để trace, không trả ra client
    this.logger.error(
      isHttpException ? exception.message : exception,
      isHttpException ? undefined : (exception as Error)?.stack,
    )

    response.status(code).json(new ErrorResponse(code, message, errors))
  }

  /** Lấy message hiển thị từ HttpException (ưu tiên message gốc, không phải mảng lỗi field) */
  private extractMessage(exception: HttpException): string {
    const res = exception.getResponse()
    // Trường hợp throw new HttpException('...') với response là string thuần
    if (typeof res === 'string') return res
    if (typeof res === 'object' && res !== null && 'message' in res) {
      const msg = (res as { message: unknown }).message
      // message là mảng (lỗi từ ValidationPipe) thì dùng message tổng quát của exception
      return Array.isArray(msg) ? exception.message : String(msg)
    }
    return exception.message
  }

  /** Lấy danh sách lỗi chi tiết (dùng cho lỗi validate DTO trả message dạng mảng) */
  private extractErrors(exception: HttpException): IErrorResponse[] {
    const res = exception.getResponse()
    if (typeof res !== 'object' || res === null || !('message' in res)) {
      return []
    }
    const msg = (res as { message: unknown }).message
    if (!Array.isArray(msg)) return []

    // Mỗi phần tử message của ValidationPipe là 1 lỗi field, map về IErrorResponse
    return msg.map(item => ({
      key: '',
      errorCode: exception.getStatus(),
      message: String(item),
    }))
  }
}
