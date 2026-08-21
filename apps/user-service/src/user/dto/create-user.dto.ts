/** DTO đầu vào để tạo user mới, validate bằng createUserSchema (Joi) qua JoiValidationPipe */
export class CreateUserDto {
  name: string
  email: string
}
