# Ticket Reservation System

A backend system for managing sports event ticket reservations, developed using **FastAPI**, **MySQL**, and **Redis**.

The system provides secure user authentication with **JWT** and **OTP (SMS/Email)**, ticket search, reservation, payment, cancellation, reporting, and administrative management features.

---

# Features

## Authentication

- User registration
- Password login
- OTP login (SMS & Gmail)
- JWT authentication
- User profile update

## Catalog

- Get cities list
- Get venues list
- Search tickets
- View ticket details

## Transactions

- Reserve tickets
- Pay for reservations
- View booking history
- Check cancellation penalty
- Submit cancellation requests
- Report ticket issues

## Administration

- View cancellation requests
- Approve or reject cancellations
- View user reports
- Update report status and responses
- View suspicious payments

---

# Technologies

- Python 3.13+
- FastAPI
- MySQL
- Redis
- JWT Authentication
- PyMySQL
- Pydantic
- Docker
- Uvicorn

---

# Project Setup

## 1. Clone the repository

```bash
git clone https://hamgit.ir/atena-molaee/ticket-reservation-system
cd ticket-reservation-system
```

---

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Database Setup

Create the database:

```sql
CREATE DATABASE TicketSystem;
```

Import the provided SQL script:

```
DataBase_Setup.sql
```

This file creates all required tables, views, triggers, procedures and sample data.

---

## 4. Configure Environment Variables

Create a `.env` file using `.env.example` as a template.

Example:

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

## 5. Start Redis

Using Docker:

```bash
docker compose up -d
```

The included `docker-compose.yml` runs Redis on port **6379**.

---

## 6. Run the Server

### Windows

```bash
py -m uvicorn app.main:app --reload
```

### Linux / macOS

```bash
python -m uvicorn app.main:app --reload
```

Server:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

ReDoc Documentation:

```
http://127.0.0.1:8000/redoc
```

---

# Redis Usage

Redis is used for:

- OTP storage and verification
- OTP expiration (TTL)
- OTP verification
- Caching ticket search results to improve performance and reduce database load

---

# Authentication

Protected endpoints require a JWT access token.

Include it in every authenticated request:

```
Authorization: Bearer <access_token>
```

Administrator APIs require a user with the **admin** role.

---

# API Documentation

## Authentication APIs

### POST `/auth/signup`

Registers a new user.

#### Request

- first_name
- last_name
- email
- phone
- password
- date_of_birth

#### Response

- JWT access token

---

### POST `/auth/login/password`

Logs in using email/phone and password.

#### Request

- username
- password

#### Response

- JWT access token

---

### POST `/auth/login/otp`

Generates and sends an OTP.

#### Request

- email or phone

#### Response

- Confirmation message

---

### POST `/auth/verify-otp`

Verifies the OTP.

#### Request

- email/phone
- otp

#### Response

- JWT access token

---

### PUT `/auth/profile`

Updates user profile.

Authentication required.

---

# Catalog APIs

### GET `/cities`

Returns all available cities.

---

### GET `/venues`

Returns all available venues.

Optional parameter:

- city_id

---

### GET `/tickets/search`

Searches available tickets.

Optional filters:

- sport_type
- city_id
- venue_id
- team_id
- category
- date_from
- date_to
- min_price
- max_price

Returns matching tickets.

---

### GET `/tickets/{ticket_id}`

Returns detailed ticket information.

---

# Transaction APIs

### POST `/transactions/reserve`

Reserves a ticket.

#### Request

- ticket_id

#### Response

Reservation information including expiration time.

---

### POST `/transactions/pay`

Pays for a reservation.

#### Request

- reservation_id
- payment_method

#### Response

Payment information.

---

### GET `/transactions/bookings`

Returns the authenticated user's reservation history.

---

### GET `/transactions/cancellation-penalty/{reservation_id}`

Returns the cancellation penalty and refund amount.

---

### POST `/transactions/cancel`

Creates a cancellation request.

#### Request

- reservation_id

---

### POST `/transactions/report`

Reports a ticket issue.

#### Request

- ticket_id
- subject
- description

---

# Administrator APIs

These endpoints require administrator authentication.

### GET `/transactions/admin/cancellations`

Returns all cancellation requests.

---

### PATCH `/transactions/admin/cancellations/{cancel_id}`

Approves or rejects a cancellation request.

#### Request

- status

---

### GET `/transactions/admin/reports`

Returns all user reports.

---

### PATCH `/transactions/admin/reports/{report_id}`

Updates report status and administrator response.

#### Request

- status
- admin_response

---

### GET `/transactions/admin/payments/suspicious`

Returns pending and failed payments.

---

# Testing the APIs

## Swagger UI

In addition to Postman and cURL, FastAPI automatically provides interactive API documentation through Swagger UI.
```
http://127.0.0.1:8000/docs
```

Swagger provides an interactive interface for testing all APIs.

---

## Postman

1. Create a request.
2. Choose the HTTP method.
3. Enter the endpoint URL.
4. Add headers if authentication is required.
5. Provide the JSON request body.
6. Send the request.

---

## cURL Examples

### User Signup

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

### Reserve Ticket

```bash
curl -X POST http://127.0.0.1:8000/transactions/reserve \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{
  "ticket_id":1
}'
```

---

# Project Structure

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

# Notes

- JWT is used for authentication.
- Redis stores temporary OTP codes with automatic expiration.
- MySQL stores all persistent application data.
- FastAPI automatically generates interactive API documentation.
- Docker Compose is used to deploy Redis.

---

## Team

| Name | HamGit | GitHub |
|------|--------|--------|
| **Atena Molaei** | [atena-molaee](https://hamgit.ir/atena-molaee) | [@atenamol](https://github.com/atenamol) |
| **Zahra Sarvari** | [zizis](https://hamgit.ir/zizis) | [@zizis0-0](https://github.com/zizis0-0) |
| **Mahshid Sheybani** | [mahishbn](https://hamgit.ir/mahishbn) | [@mahishbn](https://github.com/mahishbn) |