# Auth Testing Playbook for Shamanic Elemental Yoga App

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test Shaman',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "https://shamanic-wellness.preview.emergentagent.com/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test yoga poses
curl -X GET "https://shamanic-wellness.preview.emergentagent.com/api/yoga/poses"

# Test crystals
curl -X GET "https://shamanic-wellness.preview.emergentagent.com/api/crystals"

# Test oracle (requires auth)
curl -X POST "https://shamanic-wellness.preview.emergentagent.com/api/oracle/reading" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"question": "What guidance do I need?", "spread_type": "single"}'
```

## Step 3: Browser Testing
```javascript
// Set cookie and navigate
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "energy-grounding.preview.emergentagent.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://shamanic-wellness.preview.emergentagent.com/dashboard");
```

## Checklist
- [ ] User document has user_id field
- [ ] Session user_id matches user's user_id exactly  
- [ ] All queries use `{"_id": 0}` projection
- [ ] API returns user data with user_id field
- [ ] Browser loads dashboard (not login page)
