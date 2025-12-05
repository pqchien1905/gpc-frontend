# Git Workflow Guide - Google Photos Clone Frontend

## 📋 Quy trình làm việc với Git cho nhóm

### Nguyên tắc quan trọng
- ❌ **KHÔNG BAO GIỜ commit trực tiếp vào `main`**
- ✅ Luôn tạo branch riêng cho từng feature/task
- ✅ Tạo Pull Request (PR) để merge vào `main`
- ✅ Nhóm trưởng review và merge PR

---

## 🚀 Bắt đầu làm việc

### 1. Clone repository

```bash
git clone https://github.com/pqchien1905/gpc-frontend.git
cd gpc-frontend
npm install
```

### 2. Cấu hình Git (chỉ làm 1 lần)

```bash
git config user.name "Tên của bạn"
git config user.email "email@example.com"
```

---

## 🌿 Quy trình tạo Feature Branch

### Bước 1: Cập nhật main mới nhất

```bash
git checkout main
git pull origin main
```

### Bước 2: Tạo branch mới

**Quy tắc đặt tên branch:**
- `feature/ten-tinh-nang` - Thêm tính năng mới
- `fix/ten-loi` - Sửa bug
- `refactor/ten-module` - Cải thiện code
- `style/ten-component` - Sửa UI/CSS

```bash
# Ví dụ
git checkout -b feature/photo-grid
git checkout -b fix/upload-error
git checkout -b style/navbar-responsive
```

### Bước 3: Code và commit

```bash
git status
git add .
git commit -m "feat: thêm component PhotoGrid"
```

**Quy tắc viết commit message:**
```
<type>: <mô tả ngắn gọn>

- feat: Thêm tính năng mới
- fix: Sửa bug
- refactor: Cải thiện code
- style: Sửa CSS/UI
- docs: Cập nhật tài liệu
```

### Bước 4: Push và tạo PR

```bash
git push -u origin feature/photo-grid
```

Sau đó vào GitHub tạo Pull Request.

---

## 📊 Lệnh Git thường dùng

```bash
git status              # Xem trạng thái
git log --oneline       # Xem lịch sử
git branch -a           # Xem tất cả branch
git stash               # Lưu tạm thay đổi
git stash pop           # Lấy lại thay đổi đã lưu
```

---

## 🔗 Tham khảo thêm

Xem file `GIT_WORKFLOW.md` trong repo Backend để có hướng dẫn chi tiết hơn.
