# Nối sổ lưu bút với Google Sheet

Làm 1 lần, mất khoảng 5 phút.

## 1. Tạo Google Sheet

1. Vào [sheets.new](https://sheets.new) để tạo một bảng tính mới.
2. Đặt tên tuỳ ý, ví dụ **Lời chúc tốt nghiệp**.

> Không cần tự tạo cột — lần chạy đầu tiên script sẽ tự tạo sheet `LoiChuc`
> với 4 cột: `Thời gian | Tên | Lời chúc | Hiển thị`.

## 2. Dán code Apps Script

1. Trong Sheet, chọn menu **Tiện ích mở rộng → Apps Script**.
2. Xoá hết code mẫu trong `Code.gs`.
3. Mở file `apps-script.gs` trong thư mục này, copy toàn bộ và dán vào.
4. Bấm biểu tượng **💾 Lưu**.

## 3. Triển khai thành web app

1. Bấm nút **Triển khai (Deploy) → Tài nguyên triển khai mới**.
2. Bấm bánh răng ⚙️ bên cạnh "Chọn loại" → chọn **Ứng dụng web (Web app)**.
3. Điền:
   - **Thực thi với tư cách (Execute as):** `Tôi` (chính bạn)
   - **Ai có quyền truy cập (Who has access):** **Bất kỳ ai (Anyone)**
     — bắt buộc chọn mục này, nếu để "Anyone with Google account" thì khách
     không gửi được lời chúc.
4. Bấm **Triển khai**, rồi **Cấp quyền** → chọn tài khoản Google của bạn.
5. Màn hình cảnh báo "Google chưa xác minh ứng dụng này" là bình thường:
   bấm **Nâng cao → Truy cập <tên dự án> (không an toàn)** → **Cho phép**.
6. Copy **URL ứng dụng web**, dạng:
   `https://script.google.com/macros/s/AKfycbx....../exec`

## 4. Dán link vào thiệp

Mở `script.js`, dòng gần đầu file:

```js
var WISH_API = '';
```

Sửa thành:

```js
var WISH_API = 'https://script.google.com/macros/s/AKfycbx....../exec';
```

Lưu lại, tải lại trang — xong. Lời chúc khách gửi sẽ chạy thẳng vào Sheet
và hiện lên thiệp.

---

## Những việc hay dùng sau này

**Ẩn một lời chúc không phù hợp**
Mở Sheet, ở dòng đó sửa cột `Hiển thị` từ `TRUE` thành `FALSE`.
Lời chúc vẫn còn trong Sheet nhưng không hiện trên thiệp nữa.

**Sửa lỗi chính tả cho khách**
Sửa trực tiếp trong cột `Lời chúc` của Sheet, trang sẽ lấy bản mới.

**Sau khi sửa code Apps Script**
Phải **Triển khai → Quản lý tài nguyên triển khai → ✏️ → Phiên bản: Mới → Triển khai**
thì thay đổi mới có hiệu lực. Link web app giữ nguyên, không cần sửa `script.js`.

---

## Khi chưa dán link thì sao?

Thiệp vẫn chạy bình thường: lời chúc được lưu tạm bằng `localStorage` ngay
trên máy người xem và có dòng nhắc *"Chưa nối Google Sheet nên lời chúc đang
lưu tạm trên máy cậu."* Tiện để xem thử giao diện trước khi cấu hình.

## Vài điểm kỹ thuật

- Trang gọi Apps Script bằng **JSONP** (thẻ `<script>`) chứ không dùng `fetch`,
  nên không vướng CORS và chạy được cả khi mở `index.html` bằng nháy đúp
  (giao thức `file://`).
- Form có **ô bẫy bot** ẩn; script phía Sheet chặn gửi trùng nội dung trong
  vòng 2 phút, giới hạn tên 40 ký tự và lời chúc 300 ký tự.
- Nội dung khách nhập được escape trước khi hiển thị nên không chèn được HTML.
- Danh sách trả về tối đa 200 lời chúc mới nhất; trên thiệp chúng nằm trong
  một khung **cuộn dọc** cao khoảng 440px, mới nhất ở trên cùng.
