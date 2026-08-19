import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SuccessResponse } from 'src/utils/api.response'

/**
 * Bọc mọi response thành công theo format chuẩn { code, message, data }
 * Không áp dụng cho response đã đúng format (tránh bọc lồng nhau)
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse
> {
  /** Bọc data trả về từ handler thành SuccessResponse trước khi trả về client */
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse> {
    return next.handle().pipe(
      map((data: any) => {
        // Handler đã tự trả SuccessResponse (vd: SuccessListResponse) thì giữ nguyên, không bọc lồng
        if (data instanceof SuccessResponse) {
          return data
        }
        return new SuccessResponse(data as object)
      }),
    )
  }
}
