# Mahakal Tour and Travels — Backend API Documentation

Welcome to the backend API documentation for Mahakal Tour & Travels. This backend is structured as a feature-based modular monolithic application utilizing Node.js, Express, MongoDB (Mongoose), and TypeScript.

---

## Standard Response Structure

All endpoints return a standardized JSON response shape to simplify client integrations:

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { // Optional, returned on listing endpoints
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "message": "Specific error explanation string",
    "code": "STABLE_ERROR_CODE",
    "details": [ ... ] // Optional, containing Zod or Mongoose validation fields
  }
}
```

#### Stable Error Codes
- `VALIDATION_ERROR`: Missing/invalid fields in payload body, query, or path.
- `UNAUTHORIZED`: Invalid, expired, or missing JWT credentials.
- `NOT_FOUND`: Resource or route endpoint does not exist.
- `CONFLICT`: Unique index constraints failed (e.g., duplicate entries).
- `TOO_MANY_REQUESTS`: IP rate limit exceeded.
- `INTERNAL_ERROR`: Unexpected server error.

---

## 1. Health Endpoints

### Check Server Health
Provides basic server availability stats.
- **URL**: `/api/health`
- **Method**: `GET`
- **Access**: Public
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "OK",
      "message": "Server is healthy",
      "uptime": 120.45,
      "timestamp": "2026-07-07T15:27:24.000Z"
    }
  }
  ```

---

## 2. Booking Endpoints

### Submit Booking Inquiry
Submit a user inquiry from the taxi booking calculator or contact form.
- **URL**: `/api/bookings`
- **Method**: `POST`
- **Access**: Public (Strict Rate Limit: 10 requests / 15 minutes)
- **Body Parameters**:
  - `name` (string, optional, max 100 chars): Customer's name.
  - `phone` (string, optional): 10-digit Indian phone number (can include `+91` or `91`).
  - `vehicle` (string, required): Choice of `hatchback`, `sedan`, `suv`, `premium-suv`, `tempo`.
  - `tripType` (string, required): Choice of `local`, `one-way`, `outstation-round`, `package-inquiry`, `general-contact`.
  - `routeOrPackage` (string, optional): Details of source-destination route or package name.
  - `estimatedFare` (number, optional): Price calculated by fare calculator.
  - `rawMessage` (string, required): Full text message content ready to forward to WhatsApp.
  - `source` (string, optional): Origin marker (defaults to `"website"`).
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Booking inquiry logged successfully",
      "id": "60d0fe4f5311236168a109a2"
    }
  }
  ```

---

## 3. Admin Authentication Endpoints

### Admin Login
Log in to the administrator portal.
- **URL**: `/api/admin/login`
- **Method**: `POST`
- **Access**: Public (Strict Rate Limit: 5 requests / 15 minutes)
- **Body Parameters**:
  - `email` (string, required): A valid email address.
  - `password` (string, required): Admin login password.
- **Success Response (200)**:
  - *Cookies Set*: `refreshToken` (HttpOnly, Secure in production, SameSite: Strict, Expiry: 7 days).
  - *Body Payload*:
    ```json
    {
      "success": true,
      "data": {
        "message": "Login successful",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // 15-minute Access Token
      }
    }
    ```

### Verify Auth Token
Validate current session credentials.
- **URL**: `/api/admin/verify`
- **Method**: `GET`
- **Access**: Admin (Requires Bearer authorization token)
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Token is valid",
      "admin": {
        "email": "admin@mahakaltravels.com",
        "role": "admin"
      }
    }
  }
  ```

### Refresh Access Token
Obtain a new 15-minute access token using the HTTP-only refresh cookie.
- **URL**: `/api/admin/refresh`
- **Method**: `POST`
- **Access**: Public (Requires valid `refreshToken` cookie set during login)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // New Access Token
    }
  }
  ```

---

## 4. Admin Management Endpoints

### List Booking Inquiries
Retrieve a paginated, status-filtered history of customer booking inquiries.
- **URL**: `/api/bookings`
- **Method**: `GET`
- **Access**: Admin (Requires Bearer authorization token)
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `status` (string, optional): Filter records by `pending`, `confirmed`, or `cancelled`.
  - `page` (number, optional, default: 1): Current listing index page.
  - `limit` (number, optional, default: 10): Items per page.
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "60d0fe4f5311236168a109a2",
        "name": "Rupesh Sharma",
        "phone": "+919876543210",
        "vehicle": "sedan",
        "tripType": "outstation-round",
        "routeOrPackage": "Gwalior to Ujjain",
        "estimatedFare": 5520,
        "rawMessage": "...",
        "status": "pending",
        "source": "website",
        "createdAt": "2026-07-07T15:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### Update Booking Status
Update the status of a logged customer booking.
- **URL**: `/api/bookings/:id`
- **Method**: `PATCH`
- **Access**: Admin (Requires Bearer authorization token)
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Path Parameters**:
  - `id` (string, required): MongoDB `_id` of the booking.
- **Body Parameters**:
  - `status` (string, required): Target status state (`pending`, `confirmed`, `cancelled`).
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Booking status updated successfully",
      "data": {
        "_id": "60d0fe4f5311236168a109a2",
        "status": "confirmed"
      }
    }
  }
  ```

---

## Database Retention & Automatic TTL Cleanup

To respect temporary customer data logs, the database maintains a MongoDB Time-To-Live (TTL) index on `BookingInquiry.createdAt` that **automatically deletes** documents precisely **7 days** after insertion.

- **Note on Deletion**: MongoDB's TTL monitoring thread runs roughly once every 60 seconds; deletion may take up to 60 seconds post-expiry.
- **Production Safety Cron**: In production environments, a daily safety-net cron job runs at midnight to audit and warn about any documents older than 7 days that the MongoDB thread has not cleaned up yet.
- **Privacy Warning**: Deletion strictly affects the local database backup. It does not delete text histories on WhatsApp client devices.
