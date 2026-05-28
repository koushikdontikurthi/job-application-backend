#!/bin/bash

BASE_URL="http://localhost:3000"
EMAIL="test@example.com"
PASSWORD="secret123"

echo "1. Health check"
curl -s "$BASE_URL/health"
echo -e "\n"

echo "2. Signup"
curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo -e "\n"

echo "3. Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE"
echo -e "\n"

TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "4. Extracted token"
echo "$TOKEN"
echo -e "\n"

echo "5. Me endpoint"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "6. Missing token test"
curl -s "$BASE_URL/auth/me"
echo -e "\n"

echo "7. Invalid token format test"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: abc"
echo -e "\n"

echo "8. Wrong password test"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrongpass\"}"
echo -e "\n"