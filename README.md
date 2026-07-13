# Sweet Recipes App

Dự án ứng dụng công thức nấu ăn (Sweet Recipes).

## 🚀 Cập nhật Code mới nhất (Dành cho thành viên nhóm)

Do cấu trúc lịch sử Git của dự án vừa được tái cấu trúc và dọn dẹp lại cho gọn gàng, nên ở **LẦN CẬP NHẬT ĐẦU TIÊN NÀY**, các bạn **KHÔNG** dùng lệnh `git pull` bình thường (vì sẽ gây lỗi xung đột lịch sử).

Hãy làm đúng 2 bước sau đây để ép máy tính đồng bộ 100% với kho chứa trên Github:

```bash
# Bước 1: Kéo toàn bộ thông tin mới nhất trên Github về
git fetch origin

# Bước 2: Ép code trên máy đồng bộ hoàn toàn với Github (lưu ý: code cũ trên máy chưa push sẽ bị đè)
git reset --hard origin/main
```

> **Lưu ý cực kỳ quan trọng:**
> Hai dòng lệnh trên chỉ cần chạy **DUY NHẤT 1 LẦN NÀY THÔI**. 
> Kể từ những lần sau trở đi, mọi người cứ dùng `git pull` và `git push` bình thường như mọi ngày nhé!

## 💾 Hệ thống Tự động mồi dữ liệu (Auto Seeding)

Dự án đã được tích hợp hệ thống mồi dữ liệu thông minh. 

1. Chỉ cần gõ lệnh `npm run dev` ở thư mục backend.
2. Nếu Database MongoDB của bạn đang trống, hệ thống sẽ tự động lấy dữ liệu từ file `backend/src/data/seedData.json` (bao gồm hàng chục tài khoản, công thức, bình luận, v.v.) và tự động bơm vào Database của bạn.
3. Không cần phải import data thủ công bằng tay nữa!

**Cách cập nhật dữ liệu mồi cho team:**
Nếu bạn vừa tạo ra nhiều công thức mới trong quá trình test và muốn team cũng có những công thức đó, hãy chạy lệnh sau ở thư mục `backend` trước khi đẩy code lên Github:
```bash
npm run export-db
```
Lệnh này sẽ tự động cập nhật lại file `seedData.json`. Thành viên khác pull code về, chạy `npm run dev` là sẽ thấy toàn bộ công thức mới của bạn.
