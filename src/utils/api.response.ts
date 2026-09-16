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
  public code: number
  public message: string
  public data: object

  constructor(data = {}, message = DEFAULT_SUCCESS_MESSAGE) {
    // Gán qua this (không return object literal) để instanceof SuccessResponse hoạt động đúng
    this.code = HttpStatus.OK
    this.message = message
    this.data = data
  }
}

/** Bọc response thành công dạng danh sách theo format { code, message, data: { items, total_items } } */
export class SuccessListResponse {
  public code: number
  public message: string
  public data: { items: object; total_items: number; [key: string]: any }

  constructor(
    data = {},
    total = 0,
    additionalInfo: Record<string, any> = {},
    message = DEFAULT_SUCCESS_MESSAGE,
  ) {
    // Gán qua this (không return object literal) để instanceof SuccessListResponse hoạt động đúng
    this.code = HttpStatus.OK
    this.message = message
    this.data = {
      items: data,
      total_items: total,
      ...additionalInfo,
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
      code,
      message,
      errors,
    }
  }
}
