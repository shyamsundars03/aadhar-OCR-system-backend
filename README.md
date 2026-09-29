# Aadhaar OCR System - Backend

A secure Node.js, Express.js, and TypeScript backend server designed to process Aadhaar card images. The service performs optical character recognition (OCR), extracts key personal details (name, Aadhaar number, date of birth, gender, and address), performs cross-image verification with Verhoeff checksum validation, and returns clean, structured data via Data Transfer Objects (DTOs).

---

## Features

- **TypeScript Architecture**: Built with strict type safety, interfaces, DTOs, and modular data mappers.
- **Dependency Injection Container**: Decouples services, OCR engines, and controllers (`dependencyInjection.ts`) for high testability and clean architecture.
- **Centralized Constants System**: Extracted all error messages, HTTP status codes, and front/back document detection keywords into modular files under `src/constants/` (e.g., `aadhaarKeywords.ts`).
- **Strict Payload Validation**: Uses Zod (`aadhaar.schema.ts`) to validate incoming multipart form requests, verifying file presence, image MIME types (JPEG/PNG), and file size limits (max 2MB).
- **Tesseract.js OCR Engine Integration**: Wrapped OCR processing behind an engine contract (`IOcrEngine.interface.ts`) configured for sparse text layout (`tessedit_pageseg_mode: 11`).
- **Aadhaar Validation & Verification Engine**:
  - Performs confidence scoring on detected front and back keywords.
  - Verifies 12-digit Aadhaar numbers against the **Verhoeff Checksum algorithm**.
  - Ensures front and back uploads belong to the same card via digit sequence matching and suffix checks.
- **Advanced Text Parsing & Mapping**: Sanitizes OCR noise, contextualizes names, addresses (using PIN code matching & labels), gender, and dates before returning typed `AadhaarResponseDto` payloads.
- **Unified API Envelopes & Error Safety**: Returns standardized `ApiResponse` JSON wrappers and routes async exceptions through `catchAsync` into a centralized `errorHandler` middleware.

---

## Tech Stack

- **Runtime Environment**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **OCR Engine**: Tesseract.js
- **Execution & Development**: `tsx` (TypeScript Execution Engine)
- **Multipart Handling**: Multer (in-memory buffer storage)
- **Schema Validation**: Zod
- **Linter**: ESLint (v9 Flat Config with `typescript-eslint`)

---

## Project Structure

```text
Backend/
├── src/
│   ├── config/              # Server & dependency injection configurations
│   │   ├── cors.ts
│   │   └── dependencyInjection.ts
│   ├── constants/           # HTTP codes, error messages & document keywords
│   │   ├── aadhaarKeywords.ts
│   │   ├── errorMessages.ts
│   │   ├── httpMessage.ts
│   │   ├── httpStatus.ts
│   │   └── index.ts
│   ├── controllers/         # Thin request route handlers
│   │   └── OcrController.ts
│   ├── dtos/                # Data Transfer Objects
│   │   └── AadhaarResponseDto.ts
│   ├── interfaces/          # Service & engine contracts
│   │   ├── IAadhaarOcrService.interface.ts
│   │   └── IOcrEngine.interface.ts
│   ├── mappers/             # Data transformation & payload mapping
│   │   └── aadhaar.mapper.ts
│   ├── middleware/          # Security, upload, validation & error interceptors
│   │   ├── errorHandler.ts
│   │   ├── upload.ts
│   │   └── validate.ts
│   ├── routes/              # Express endpoint routing
│   │   └── ocr.routes.ts
│   ├── services/            # Core business, OCR engine & validation logic
│   │   ├── AadhaarOcrService.ts
│   │   ├── AadhaarValidationService.ts
│   │   └── TesseractOcrEngine.ts
│   ├── types/               # TypeScript type definitions
│   │   └── aadhaar.types.ts
│   ├── utils/               # Sanitizers, parsers, Verhoeff checksum & helpers
│   │   ├── ApiResponse.ts
│   │   ├── AppError.ts
│   │   ├── aadhaarParser.ts
│   │   ├── catchAsync.ts
│   │   └── verhoeff.ts
│   └── validations/         # Zod schemas for request checks
│       └── aadhaar.schema.ts
├── .env                     # Server environment settings
├── eslint.config.js         # ESLint Rules
├── package.json             # Scripts and module dependencies
├── server.ts                # Server entry point
├── tsconfig.json            # TypeScript configuration
└── README.md                # Documentation guide
```

---

## Setup & Running Locally

### Prerequisites

Make sure you have **Node.js (v18 or higher)** and **npm** installed on your machine.

### 1. Install Dependencies

Navigate to the `Backend` directory and install the packages:

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Create a file named `.env` in the root of the `Backend/` directory:

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3. Run the Server

#### Development Mode (Auto-reloading via `tsx`)
```bash
npm run dev
```

#### Production Build & Start
```bash
npm run build
npm start
```

On start, the server binds to the configured port and prints:
```text
=========================================
Backend Server is running on port: 5000
Health Check: http://localhost:5000/api/status
=========================================
```

### 4. Code Quality & Build Verification

Run TypeScript compilation and lint checks:

```bash
# Check TypeScript types & compile
npm run build

# Run ESLint check
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
Submit front and back Aadhaar images for validation and data extraction.

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
