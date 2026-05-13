# Auth Testing Playbook (Cookie Session Flow)

## Base URL
Use `REACT_APP_BACKEND_URL` from `/app/frontend/.env`.

```bash
BASE_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d'=' -f2-)
```

## 1) Register + Cookie Creation
```bash
EMAIL="authtest_$(date +%s)@example.com"
PASS="TestPass123!"

curl -s -c /tmp/auth.cookies -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"name\":\"Auth Test\"}"
```

Expected:
- HTTP 200
- Response includes `user` and `session_token`
- `session_token` cookie set

## 2) Session Validation (`/auth/me`)
```bash
curl -s -b /tmp/auth.cookies "$BASE_URL/api/auth/me"
```

Expected:
- HTTP 200
- Returns same user email created in Step 1

## 3) Logout + Session Invalidation
```bash
curl -s -b /tmp/auth.cookies -c /tmp/auth.cookies -X POST "$BASE_URL/api/auth/logout"
curl -s -o /tmp/me_after_logout.json -w "%{http_code}" -b /tmp/auth.cookies "$BASE_URL/api/auth/me"
```

Expected:
- Logout HTTP 200
- Subsequent `/auth/me` returns HTTP 401

## 4) Login Flow
```bash
curl -s -c /tmp/auth_login.cookies -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
```

Expected:
- HTTP 200
- `session_token` cookie set
- User payload returned

## 5) Google Payload Endpoint
```bash
curl -s -c /tmp/auth_google.cookies -X POST "$BASE_URL/api/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"user":{"id":"google_test_user","email":"google_auth_test@example.com","name":"Google Test User"}}'
```

Expected:
- HTTP 200
- Returns `user` + `session_token`

## 6) Invalid Session Exchange Safety
```bash
curl -s -o /tmp/session_invalid.json -w "%{http_code}" -X POST "$BASE_URL/api/auth/session" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"invalid-session-id"}'
```

Expected:
- HTTP 400 (controlled validation error)
- No 500/unhandled exception

## 7) Admin Gate Check (Unauthenticated)
```bash
curl -I "$BASE_URL/admin"
```

Expected:
- Frontend route accessible, but admin data/actions require authenticated admin session in app.
