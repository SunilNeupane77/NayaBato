#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if RESEND_API_KEY is set
if [ -z "$RESEND_API_KEY" ]; then
  echo "Error: RESEND_API_KEY not set in .env file"
  exit 1
fi

# Set default email addresses
FROM_EMAIL=${EMAIL_FROM:-"notifications@nayabato.org"}
TO_EMAIL=${1:-"sunilneupane957@gmail.com"}  # First argument or default

# Current date/time
CURRENT_DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "Sending test email from $FROM_EMAIL to $TO_EMAIL"
echo "Using Resend API Key: ${RESEND_API_KEY:0:5}... (hidden)"

# Execute the curl command
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"from\": \"Nayabato Test <$FROM_EMAIL>\",
    \"to\": [\"$TO_EMAIL\"],
    \"subject\": \"Hello from Nayabato - $CURRENT_DATE\",
    \"html\": \"<div style='font-family: sans-serif; max-width: 600px;'><h1 style='color: #2563eb;'>Nayabato Email Test</h1><p>This is a test email sent on $CURRENT_DATE</p><p>If you received this email, your email configuration is working correctly.</p></div>\"
  }"

echo -e "\nEmail sending request complete. Check your inbox at $TO_EMAIL"
