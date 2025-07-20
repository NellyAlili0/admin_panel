## ✅ Authentication

### http://localhost:3001/api/auth/register

New user registration: Parent/Driver

Type: POST

Fields Required:

- names
- email
- password
- phone_number
- county
- neighborhood
- kind => Driver

returns an access token

### http://localhost:3001/api/auth/login

User Login: Parent/Driver

Type:POST

Fields Required:

- email
- password
- kind => Driver | Parent

returns an access token

### http://localhost:3001/api/auth/security

- Authentication Required

Password Change

Type: POST

Fields Required:

- old_password
- new_password

returns success status
