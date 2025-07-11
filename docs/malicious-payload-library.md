# Malicious Payload Library

| Attack Type     | Payload                                       | Description                 | Expected Outcome     | Source                  |
| --------------- | --------------------------------------------- | --------------------------- | -------------------- | ----------------------- |
| XSS             | <script>alert(1)</script>                     | Basic script injection      | Blocked or sanitized | OWASP XSS Cheat Sheet   |
| XSS             | "><img src=x onerror=alert(1)>                | Attribute-based XSS         | Blocked or sanitized | OWASP XSS Cheat Sheet   |
| XSS             | \u003cscript\u003ealert(1)\u003c/script\u003e | Encoded script tag          | Blocked or sanitized | OWASP XSS Cheat Sheet   |
| SQLi            | '; DROP TABLE users; --                       | Classic SQL injection       | Blocked or error     | OWASP SQLi Cheat Sheet  |
| SQLi            | " OR 1=1 --                                   | Boolean-based SQLi          | Blocked or error     | OWASP SQLi Cheat Sheet  |
| SQLi            | admin' --                                     | Authentication bypass       | Blocked or error     | OWASP SQLi Cheat Sheet  |
| Buffer Overflow | AAAAAAAAAA... (10,000x)                       | Oversized input             | Blocked or error     | Security best practices |
| Buffer Overflow | \x90\x90\x90\x90... (4096x)                   | NOP sled                    | Blocked or error     | Security best practices |
| Unicode         | \u202Eevil.exe                                | RTL override                | Blocked or sanitized | Unicode attacks         |
| Unicode         | \uFFFD                                        | Invalid Unicode replacement | Blocked or sanitized | Unicode attacks         |
| Malformed       | null                                          | Null value                  | Blocked or error     | Edge case               |
| Malformed       | undefined                                     | Undefined value             | Blocked or error     | Edge case               |
| Malformed       |                                               | Empty string                | Blocked or error     | Edge case               |
| Malformed       | {"nested": {"a": [1,2,3]}}                    | Nested object               | Blocked or error     | Edge case               |
| Malformed       | ["a", "b", "c"]                               | Array input                 | Blocked or error     | Edge case               |
| Malformed       | 😈                                            | Emoji/special char          | Blocked or sanitized | Edge case               |
| Malformed       | \u0000                                        | Null byte                   | Blocked or sanitized | Edge case               |
