export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Termpaperr API",
    version: "1.0.0",
    description: "Backend API documentation for auth and protected routes.",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      AuthRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255, example: "Jane Doe" },
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["accessToken", "refreshToken", "expiresIn"],
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          expiresIn: { type: "integer", example: 900 },
        },
      },
      RegisterPendingResponse: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example:
              "Registration successful. Check your inbox for a link to confirm your email.",
          },
        },
      },
      ResendVerificationRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
        },
      },
      ResendVerificationResponse: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
        },
      },
      MeResponse: {
        type: "object",
        required: ["id", "name", "email", "role", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["admin", "author", "user"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UpdateProfileRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255, example: "Jane Doe" },
        },
      },
      UpdateProfileResponse: {
        type: "object",
        required: ["accessToken", "expiresIn"],
        properties: {
          accessToken: { type: "string", description: "New JWT including updated name claim" },
          expiresIn: { type: "integer", example: 900 },
        },
      },
      CoverUploadResponse: {
        type: "object",
        required: ["coverUrl"],
        properties: {
          coverUrl: {
            type: "string",
            format: "uri",
            example: "http://localhost:3000/uploads/covers/550e8400-e29b-41d4-a716-446655440000.jpg",
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user and return JWT tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created and authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user and return JWT tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Email not verified yet",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/verify-email": {
      get: {
        tags: ["Auth"],
        summary: "Confirm email using token from the registration email",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description:
              "Newly verified: JWT tokens. Already verified: message only (alreadyVerified: true)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description:
                    "{ alreadyVerified, message } or { alreadyVerified, accessToken, refreshToken, expiresIn }",
                },
              },
            },
          },
          "400": {
            description: "Invalid or expired token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/resend-verification": {
      post: {
        tags: ["Auth"],
        summary: "Resend confirmation email (only sent if account exists and is unverified)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResendVerificationRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Always returns the same generic message",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResendVerificationResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/uploads/cover": {
      post: {
        tags: ["Uploads"],
        summary: "Upload a book cover image (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["cover"],
                properties: {
                  cover: {
                    type: "string",
                    format: "binary",
                    description: "JPEG, PNG, or WebP (max 5 MB by default)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cover uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CoverUploadResponse" },
              },
            },
          },
          "400": {
            description: "Missing file or invalid image",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update current user display name",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Name updated; replace stored access token with the new one",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProfileResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
} as const;
