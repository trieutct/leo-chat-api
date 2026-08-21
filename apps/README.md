# Demo microservices: RabbitMQ (sync + async)

Sơ đồ:

```
user-service (producer, HTTP :3001) ──► RabbitMQ ──► email-service (consumer)
```

- **Sync (RPC)**: `user-service` gọi `verify_email` sang `email-service`, dùng
  reply queue + `correlationId` (RabbitMQ transport của NestJS tự xử lý), chờ
  kết quả rồi mới tạo user.
- **Async (event)**: sau khi tạo user xong, `user-service` bắn event
  `user_created` (fire-and-forget) để `email-service` gửi mail chào mừng,
  không chờ phản hồi.

`user-service` dùng chung Prisma client + PostgreSQL (`DATABASE_URL`) với
app gốc, ghi vào bảng `users` (model `User` trong `prisma/schema.prisma`).
`email-service` không đụng DB, chỉ xử lý message.

## Chạy demo

1. Khởi động RabbitMQ:

   ```bash
   docker compose up -d
   ```

   Management UI: http://localhost:15672 (guest/guest)

2. Cài dependency + generate Prisma client (nếu chưa):

   ```bash
   yarn install
   yarn prisma:generate
   ```

3. Chạy 2 service ở 2 terminal riêng:

   ```bash
   yarn start:email-service   # consumer, lắng nghe queue
   yarn start:user-service    # producer, HTTP :3001
   ```

4. Test tạo user hợp lệ (verify pass → tạo user → gửi mail async):

   ```bash
   curl -X POST http://localhost:3001/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Trieu","email":"trieu@example.com"}'
   ```

   Log ở `email-service` sẽ thấy `[SYNC]` verify trước, sau đó `[ASYNC]` gửi
   mail chào mừng.

5. Test verify thất bại (domain bị chặn → không tạo user):

   ```bash
   curl -X POST http://localhost:3001/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Trieu","email":"trieu@blocked.com"}'
   ```

   `user-service` trả về `400 Bad Request`, không có event `user_created` nào
   được bắn đi.

## Biến môi trường

Xem `.env` / `.env.example` ở root: `RABBITMQ_URL`, `USER_SERVICE_PORT`.
`email-service` không cần HTTP port vì chỉ chạy như pure microservice.
