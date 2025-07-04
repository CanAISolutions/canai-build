# CanAI API Documentation

## Overview

This directory contains API documentation for the CanAI Emotional Sovereignty Platform backend
services.

## Contents

- **endpoints.md** - Complete API endpoint documentation
- API schemas and request/response examples
- Authentication and authorization guides
- Rate limiting and error handling documentation

## API Structure

The CanAI API follows RESTful conventions and supports the complete 9-stage user journey:

### Core Endpoints

| Stage | Endpoint              | Purpose                        |
| ----- | --------------------- | ------------------------------ |
| F1    | `/v1/messages`        | Trust indicators and messaging |
| F2    | `/v1/validate-input`  | Funnel input validation        |
| F3    | `/v1/generate-sparks` | Spark generation               |
| F4    | `/v1/stripe-session`  | Payment processing             |
| F5    | `/v1/save-progress`   | Progress tracking              |
| F6    | `/v1/intent-mirror`   | Intent validation              |
| F7    | `/v1/deliverable`     | Content generation             |
| F8    | `/v1/spark-split`     | Comparison analysis            |
| F9    | `/v1/feedback`        | Feedback capture               |

## Authentication

All API endpoints require authentication via Memberstack JWT tokens.

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Error Handling

All API responses follow a consistent error format with appropriate HTTP status codes.

---

[🏠 Back to Docs](../README.md) | [📖 Full API Specification](../api-contract-specification.md)
