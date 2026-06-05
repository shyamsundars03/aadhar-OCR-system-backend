# Aadhaar OCR System - Backend

A secure Node.js and Express.js backend server designed to process Aadhaar card images. The service performs optical character recognition (OCR), extracts key personal details (name, Aadhaar number, date of birth, gender, and address), performs cross-image verification, and returns clean, structured data.

---

## Features

- **Strict Schema Validation**: Uses Zod to validate incoming multipart form requests, verifying that both files are present, are valid image mime-types (JPEG/PNG), and do not exceed the 2MB size limit.
- **Tesseract.js OCR Integration**: Runs OCR processing on memory buffers with custom config parameters (`tessedit_pageseg_mode: 11` for sparse text layout) to optimize raw text detection.
- **Advanced Text Parsing Engine**: 
  - Sanitizes raw text by removing non-ASCII and junk OCR artifacts.
  - Resolves names using contextual anchors (names above/surrounding keywords like "DOB", "Date of Birth", "Year of Birth", and gender lines).
  - Resolves addresses by parsing structured labels ("Address:", "Address", "S/O", "W/O", "D/O") and falls back to locating PIN codes and matching postal sequences.
  - Normalizes genders (Male, Female, Transgender).
  - Normalizes date strings to standard formats.
- **Consistency Verification**: Checks that the Aadhaar number extracted from the front side exactly matches the Aadhaar number extracted from the back side. Throws a validation error if there is a discrepancy.
- **Unified API Responses**: Utilizes a standardized `ApiResponse` wrapper class to return clean JSON envelopes for success, failure, and error responses.
- **Global Error Handling**: Wraps controllers with a `catchAsync` utility to guarantee unhandled rejection safety and routes all application exceptions through a centralized error-handling middleware.
- **Clean Configuration**: Uses `.env` configuration for server ports and CORS origins.
- **No In-Code Comments**: Follows a clean code approach with zero unnecessary inline comments.

---

## Tech Stack

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **OCR Engine**: Tesseract.js
- **Multipart Data Handler**: Multer (in-memory storage)
- **Input Validation**: Zod
- **Linter**: ESLint (v9 Flat Config)
- **Development Monitor**: Nodemon

---

## Project Structure

```text
Backend/
├── src/
│   ├── config/              # Server configurations
│   │   └── cors.js
│   ├── constants/           # HTTP codes and system messages
│   │   ├── httpMessage.js
│   │   ├── httpStatus.js
│   │   └── index.js
│   ├── controllers/         # Thin request route handlers
│   │   └── ocr.controller.js
│   ├── middleware/          # Security, validation, and error interceptors
│   │   ├── errorHandler.js
│   │   ├── upload.js
│   │   └── validate.js
│   ├── routes/              # Express endpoint routing
│   │   └── ocr.routes.js
│   ├── services/            # Core business & OCR engine operations
│   │   └── ocr.service.js
│   ├── utils/               # Sanitizers, parsers, and custom helpers
│   │   ├── ApiResponse.js
│   │   ├── AppError.js
│   │   ├── aadhaarParser.js
│   │   └── catchAsync.js
│   └── validations/         # Zod schemas for payload checks
│       └── ocr.validation.js
├── .env                     # Server environment settings
├── app.js                   # Express App pipeline configuration
├── eslint.config.js         # ESLint Rules
├── package.json             # Scripts and module dependencies
├── server.js                # Server entry listener
└── README.md                # Documentation guide
```

---

## Setup & Running Locally

### Prerequisites

Make sure you have **Node.js (v18 or higher)** installed on your machine.

### 1. Install Dependencies

Navigate to the `Backend` directory and install the packages:

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Create a file named `.env` in the root of the `Backend/` directory and configure the environment variables:

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3. Run the Server

#### Development Mode (Auto-restart via Nodemon)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

On start, the server binds to the configured port and prints:
```text
=========================================
Backend Server is running on port: 5000
Health Check: http://localhost:5000/api/status
=========================================
```

### 4. Code Quality & Linting

Ensure that files are conforming to the strict ESLint rules:

```bash
npm run lint
```

---

## API Specifications

### 1. Health Status
Check if the backend server is operational.

- **URL**: `/api/status`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Backend server is running smoothly."
  }
  ```

### 2. Process Aadhaar OCR
Submit front and back Aadhaar images for data extraction.

- **URL**: `/api/ocr`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body Fields**:
  - `front` (File, required): Front side image of Aadhaar Card. Max 2MB.
  - `back` (File, required): Back side image of Aadhaar Card. Max 2MB.
- **Success Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "message": "Aadhaar processed successfully.",
    "data": {
      "aadhaarNumber": "123456789012",
      "name": "JOHN DOE",
      "dob": "01/01/1990",
      "gender": "Male",
      "address": "123, Main Street, Bengaluru, Karnataka, 560001"
    }
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "status": "fail",
    "message": "The Aadhaar numbers on the front and back images do not match. Please upload images of the same Aadhaar card."
  }
  ```
- **Error Response (`500 Internal Server Error`)**:
  ```json
  {
    "status": "error",
    "message": "OCR Processing failed: [Specific detailed description]"
  }
  ```
