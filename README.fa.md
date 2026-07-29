# سیستم رزرو بلیط

یک سیستم بک‌اند برای مدیریت رزرو بلیط رویدادهای ورزشی، توسعه‌یافته با ‏**FastAPI**‏، ‏**MySQL**‏ و ‏**Redis**.‏

این سیستم امکاناتی مانند احراز هویت امن کاربر با ‏**JWT**‏ و ‏**OTP (‏پیامک/ایمیل)**، جست‌وجوی بلیط، رزرو، پرداخت، لغو رزرو، گزارش‌دهی و امکانات مدیریتی را فراهم می‌کند.

---

# امکانات

## احراز هویت

- ثبت‌نام کاربر
- ورود با رمز عبور
- ورود با ‏OTP (‏پیامک و جیمیل)
- احراز هویت ‏JWT‏
- به‌روزرسانی پروفایل کاربر

## کاتالوگ

- دریافت لیست شهرها
- دریافت لیست سالن‌ها
- جست‌وجوی بلیط
- مشاهده جزئیات بلیط

## تراکنش‌ها

- رزرو بلیط
- پرداخت رزروها
- مشاهده تاریخچه رزروها
- بررسی جریمه لغو رزرو
- ثبت درخواست لغو
- گزارش مشکلات بلیط

## مدیریت

- مشاهده درخواست‌های لغو رزرو
- تأیید یا رد لغو رزروها
- مشاهده گزارش‌های کاربران
- به‌روزرسانی وضعیت و پاسخ گزارش‌ها
- مشاهده پرداخت‌های مشکوک

---

# تکنولوژی‌ها

- ‏Python 3.13+‏
- ‏FastAPI‏
- ‏MySQL‏
- ‏Redis‏
- ‏JWT Authentication‏
- ‏PyMySQL‏
- ‏Pydantic‏
- ‏Docker‏
- ‏Uvicorn‏

---

# راه‌اندازی پروژه

## ۱. کلون کردن مخزن

```bash
git clone https://hamgit.ir/atena-molaee/ticket-reservation-system
cd ticket-reservation-system
```

---

## ۲. نصب وابستگی‌ها

```bash
pip install -r requirements.txt
```

---

## ۳. راه‌اندازی پایگاه داده

ساخت پایگاه داده:

```sql
CREATE DATABASE TicketSystem;
```

ایمپورت کردن اسکریپت ‏SQL‏ ارائه‌شده:

```
DataBase_Setup.sql
```

این فایل تمام جدول‌ها، ویوها، تریگرها، پروسیجرها و داده‌های نمونه مورد نیاز را ایجاد می‌کند.

---

## ۴. پیکربندی متغیرهای محیطی

یک فایل ‏`.env`‏ با استفاده از ‏`.env.example`‏ به‌عنوان الگو ایجاد کنید.

نمونه:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=TicketSystem
DB_USER=root
DB_PASSWORD=your_database_password

SECRET_KEY=your_secret_key

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
OTP_EXPIRE_SECONDS=300

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
```
---

## ۵. اجرای ‏Redis‏

با استفاده از ‏Docker:‏

```bash
docker compose up -d
```

فایل ‏`docker-compose.yml`‏ موجود، ‏Redis‏ را روی پورت ‏**6379**‏ اجرا می‌کند.

---

## ۶. اجرای سرور

### ویندوز

```bash
py -m uvicorn app.main:app --reload
```

### لینوکس ‏/ macOS‏

```bash
python -m uvicorn app.main:app --reload
```

سرور:

```
http://127.0.0.1:8000
```

مستندات ‏Swagger:‏

```
http://127.0.0.1:8000/docs
```

مستندات ‏ReDoc:‏

```
http://127.0.0.1:8000/redoc
```

---

# استفاده از ‏Redis‏

‏Redis‏ برای موارد زیر استفاده می‌شود:

- ذخیره‌سازی و تأیید ‏OTP‏
- انقضای ‏OTP (TTL)‏
- تأیید ‏OTP‏
- کش کردن نتایج جست‌وجوی بلیط برای بهبود کارایی و کاهش بار پایگاه داده

---

# احراز هویت

اندپوینت‌های محافظت‌شده به یک توکن دسترسی ‏JWT‏ نیاز دارند.

آن را در هر درخواست احراز هویت‌شده قرار دهید:

```
Authorization: Bearer <access_token>
```

‏API‏ های مدیریتی به کاربری با نقش ‏**admin**‏ نیاز دارند.

---

# مستندات ‏API‏

## ‏API‏ های احراز هویت

### ‏POST `/auth/signup`‏

یک کاربر جدید ثبت می‌کند.

#### درخواست

- ‏first_name‏
- ‏last_name‏
- ‏email‏
- ‏phone‏
- ‏password‏
- ‏date_of_birth‏

#### پاسخ

- توکن دسترسی ‏JWT‏

---

### ‏POST `/auth/login/password`‏

با ایمیل/شماره تلفن و رمز عبور وارد می‌شود.

#### درخواست

- ‏username‏
- ‏password‏

#### پاسخ

- توکن دسترسی ‏JWT‏

---

### ‏POST `/auth/login/otp`‏

یک ‏OTP‏ تولید و ارسال می‌کند.

#### درخواست

- ‏email‏ یا ‏phone‏

#### پاسخ

- پیام تأیید

---

### ‏POST `/auth/verify-otp`‏

‏OTP‏ را تأیید می‌کند.

#### درخواست

- ‏email/phone‏
- ‏otp‏

#### پاسخ

- توکن دسترسی ‏JWT‏

---

### ‏PUT `/auth/profile`‏

پروفایل کاربر را به‌روزرسانی می‌کند.

نیاز به احراز هویت دارد.

---

# ‏API‏ های کاتالوگ

### ‏GET `/cities`‏

تمام شهرهای موجود را برمی‌گرداند.

---

### ‏GET `/venues`‏

تمام سالن‌های موجود را برمی‌گرداند.

پارامتر اختیاری:

- ‏city_id‏

---

### ‏GET `/tickets/search`‏

بلیط‌های موجود را جست‌وجو می‌کند.

فیلترهای اختیاری:

- ‏sport_type‏
- ‏city_id‏
- ‏venue_id‏
- ‏team_id‏
- ‏category‏
- ‏date_from‏
- ‏date_to‏
- ‏min_price‏
- ‏max_price‏

بلیط‌های منطبق را برمی‌گرداند.

---

### ‏GET `/tickets/{ticket_id}`‏

اطلاعات تفصیلی بلیط را برمی‌گرداند.

---

# ‏API‏ های تراکنش

### ‏POST `/transactions/reserve`‏

یک بلیط را رزرو می‌کند.

#### درخواست

- ‏ticket_id‏

#### پاسخ

اطلاعات رزرو شامل زمان انقضا.

---

### ‏POST `/transactions/pay`‏

هزینه یک رزرو را پرداخت می‌کند.

#### درخواست

- ‏reservation_id‏
- ‏payment_method‏

#### پاسخ

اطلاعات پرداخت.

---

### ‏GET `/transactions/bookings`‏

تاریخچه رزروهای کاربر احراز هویت‌شده را برمی‌گرداند.

---

### ‏GET `/transactions/cancellation-penalty/{reservation_id}`‏

جریمه لغو و مبلغ بازپرداخت را برمی‌گرداند.

---

### ‏POST `/transactions/cancel`‏

یک درخواست لغو ایجاد می‌کند.

#### درخواست

- ‏reservation_id‏

---

### ‏POST `/transactions/report`‏

یک مشکل مربوط به بلیط را گزارش می‌دهد.

#### درخواست

- ‏ticket_id‏
- ‏subject‏
- ‏description‏

---

# ‏API‏ های مدیریتی

این اندپوینت‌ها به احراز هویت مدیریتی نیاز دارند.

### ‏GET `/transactions/admin/cancellations`‏

تمام درخواست‌های لغو را برمی‌گرداند.

---

### ‏PATCH `/transactions/admin/cancellations/{cancel_id}`‏

یک درخواست لغو را تأیید یا رد می‌کند.

#### درخواست

- ‏status‏

---

### ‏GET `/transactions/admin/reports`‏

تمام گزارش‌های کاربران را برمی‌گرداند.

---

### ‏PATCH `/transactions/admin/reports/{report_id}`‏

وضعیت گزارش و پاسخ مدیر را به‌روزرسانی می‌کند.

#### درخواست

- ‏status‏
- ‏admin_response‏

---

### ‏GET `/transactions/admin/payments/suspicious`‏

پرداخت‌های در انتظار و ناموفق را برمی‌گرداند.

---

# تست کردن ‏API‏ ها

## ‏Swagger UI‏

علاوه بر ‏Postman‏ و ‏cURL‏، ‏FastAPI‏ به‌صورت خودکار مستندات تعاملی ‏API‏ را از طریق ‏Swagger UI‏ ارائه می‌دهد.
```
http://127.0.0.1:8000/docs
```

‏Swagger‏ یک رابط تعاملی برای تست تمام ‏API‏ ها فراهم می‌کند.

---

## ‏Postman‏

۱. یک درخواست ایجاد کنید.
۲. متد ‏HTTP‏ را انتخاب کنید.
۳. آدرس اندپوینت را وارد کنید.
۴. در صورت نیاز به احراز هویت، هدرها را اضافه کنید.
۵. بدنه درخواست ‏JSON‏ را وارد کنید.
۶. درخواست را ارسال کنید.

---

## نمونه‌های ‏cURL‏

### ثبت‌نام کاربر

```bash
curl -X POST http://127.0.0.1:8000/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "first_name":"John",
  "last_name":"Doe",
  "email":"john@example.com",
  "phone":"09123456789",
  "password":"password123",
  "date_of_birth":"2000-01-01"
}'
```

### رزرو بلیط

```bash
curl -X POST http://127.0.0.1:8000/transactions/reserve \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{
  "ticket_id":1
}'
```

---

# ساختار پروژه

```
app/
│
├── auth/
├── cache/
├── database/
├── queries/
├── routers/
├── schemas/
├── services/
├── config.py
└── main.py

docker-compose.yml
requirements.txt
.env.example
DataBase_Setup.sql
README.md
```

---

# نکات

- از ‏JWT‏ برای احراز هویت استفاده می‌شود.
- ‏Redis‏ کدهای ‏OTP‏ موقت را با انقضای خودکار ذخیره می‌کند.
- ‏MySQL‏ تمام داده‌های دائمی برنامه را ذخیره می‌کند.
- ‏FastAPI‏ به‌صورت خودکار مستندات تعاملی ‏API‏ تولید می‌کند.
- ‏Docker Compose‏ برای دیپلوی ‏Redis‏ استفاده می‌شود.

---

## تیم

| نام | HamGit | GitHub |
|------|--------|--------|
| **آتنا مولایی** | [atena-molaee](https://hamgit.ir/atena-molaee) | [@atenamol](https://github.com/atenamol) |
| **زهرا سروری** | [zizis](https://hamgit.ir/zizis) | [@zizis0-0](https://github.com/zizis0-0) |
| **مهشید شیبانی** | [mahishbn](https://hamgit.ir/mahishbn) | [@mahishbn](https://github.com/mahishbn) |
