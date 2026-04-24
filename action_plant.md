## Hãy cập nhật mã nguồn theo các yêu cầu chi tiết dưới đây:

1. Thương hiệu & Cá nhân hóa (Branding)

- Icon App: Thay đổi toàn bộ icon ứng dụng (bao gồm icon Taskbar và Window Icon) thành logo độc quyền của Trung Nguyễn.

- Footer/Credit: Tại mục "Developed By", thiết kế lại giao diện theo phong cách tối giản (Minimalism).
  - Sử dụng font chữ thanh mảnh, có kèm icon Github/LinkedIn nhỏ.

  - Nội dung: Crafted with ❤️ by Trung Nguyễn.

  - Căn chỉnh gọn gàng dưới cùng góc phải màn hình, độ mờ (opacity) khoảng 0.7 để không làm xao nhãn người dùng.

2. Tinh chỉnh Cấu trúc & Layout
   - Navigation: Loại bỏ hoàn toàn Tab Settings khỏi thanh điều hướng (Sidebar/Navbar).

   - Layout Quick Install: Tái cấu trúc lại giao diện cài đặt nhanh:
   * Thay đổi từ dạng danh sách (List) sang dạng Grid Cards.

   * Mỗi Card phiên bản PHP bao gồm: Icon phiên bản, Tên (PHP 8.x), Trạng thái (Installed/Available), và nút Action nổi bật.

   * Thêm hiệu ứng Hover cho các thẻ card để tăng tính tương tác.

3. Trải nghiệm người dùng (UX) & Hiệu ứng

- Dark/Light Mode: Triển khai tính năng thay đổi giao diện Tối/Sáng. Hãy chọn màu nền là Deep Dark (#121212) hoặc Navy Dark.

* Sử dụng biến CSS (CSS Variables) để quản lý bảng màu.

* Thêm một nút Switch (Toggle) đẹp mắt ở góc trên màn hình để chuyển đổi nhanh.

* Hệ thống phải ghi nhớ lựa chọn của người dùng.

- Project Pagination: Xử lý tình trạng quá tải khi có nhiều dự án trong Tab Project:
  - Áp dụng cơ chế Infinite Scroll (Cuộn vô hạn) hoặc Load More (Tải thêm).

  - Đảm bảo Performance không bị lag khi danh sách lên đến hàng trăm dự án bằng cách sử dụng Virtual List nếu cần thiết.

4. Yêu cầu kỹ thuật kèm theo
   - Đảm bảo tính Responsive cho cửa sổ Electron khi co giãn.

   - Mã nguồn phải sạch, tách biệt giữa Logic và View.

   - Sử dụng thư viện icon như Lucide React hoặc FontAwesome để các icon trông đồng bộ và hiện đại hơn.
