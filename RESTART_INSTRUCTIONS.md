# Server Restart Required

## Issue
The development server is still using cached files with the old import paths.

## Solution
1. Stop the current development server (Ctrl+C)
2. Clear the build cache: `rm -rf .next`
3. Restart the server: `npm run dev`

## Files Fixed
All API routes now use the correct import path: `@/lib/db/connect`

The error should be resolved after restarting the development server.
