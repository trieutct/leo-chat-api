import { Injectable } from '@nestjs/common'
import { HttpStatus } from 'src/common/constants'

export const DEFAULT_SUCCESS_MESSAGE = 'success'

/** Shape response chuẩn dùng chung cho toàn bộ API */
@Injectable()
export class ApiResponse<T> {
  public code!: number
  public message!: string
  public data!: T
  public errors!: T
}

/** Shape dữ liệu dạng danh sách kèm tổng số bản ghi */
export class CommonListResponse<T> {
  items!: T[]
  total_items!: number
}

/** Chi tiết 1 lỗi cụ thể trong response lỗi (ví dụ lỗi từng field khi validate) */
export interface IErrorResponse {
  key: string
  error_code: number
  message: string
  data?: any
}

/** Bọc response thành công theo format { code, message, data } */
export class SuccessResponse {
  constructor(data = {}, message = DEFAULT_SUCCESS_MESSAGE) {
    return {
      success: true,
      code: HttpStatus.OK,
      message,
      data,
    }
  }
}

/** Bọc response thành công dạng danh sách theo format { code, message, data: { items, total_items } } */
export class SuccessListResponse {
  constructor(
    data = {},
    total = 0,
    additionalInfo: Record<string, any> = {},
    message = DEFAULT_SUCCESS_MESSAGE,
  ) {
    return {
      code: HttpStatus.OK,
      message,
      data: {
        items: data,
        total_items: total,
        ...additionalInfo,
      },
    }
  }
}

/** Bọc response lỗi theo format { code, message, errors } */
export class ErrorResponse {
  constructor(
    code = HttpStatus.INTERNAL_SERVER_ERROR,
    message = '',
    errors: IErrorResponse[] = [],
  ) {
    return {
      success: false,
      code,
      message,
      errors,
    }
  }
}
