# Bộ chạy offline cho Windows x64

`win-x64/node.exe` là Node.js **v24.20.0** bản chính thức, được trích nguyên vẹn từ:

- Archive: https://nodejs.org/dist/v24.20.0/node-v24.20.0-win-x64.zip
- Bảng SHA-256 chính thức: https://nodejs.org/dist/v24.20.0/SHASUMS256.txt
- SHA-256 của archive đã đối chiếu: `6cac9ffbca8f6a47091e4b5c772e0606049c3871cb67d900c0cedde630e545ba`
- SHA-256 của `node.exe`: `5c976096e04e5c2c1f091938926234cc9fbebfe9787ddd149351b3b0ecc707b5`

Chỉ trích `node.exe` và `LICENSE` từ archive; không cài vào Windows, không kèm npm hoặc gói phụ thuộc cần tải thêm. `OPEN.cmd` ưu tiên bộ chạy này, sau đó mới tìm Node.js đã cài trên máy.

Giấy phép đầy đủ và các thông báo bên thứ ba của Node.js được giữ trong `win-x64/LICENSE`. Bộ chạy dành cho Windows x64; các hệ điều hành khác sử dụng Node.js tương thích được cài riêng.
