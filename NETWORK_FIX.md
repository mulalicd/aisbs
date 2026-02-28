# Network Configuration Fix

## Problem
When accessing the application via the public sandbox URL, the frontend was trying to connect to `localhost:5000` which doesn't exist in the browser context. This caused "Network Error" and "ERR_CONNECTION_REFUSED" errors.

## Root Cause
The frontend code had hardcoded references to `http://localhost:5000` and was importing axios directly without configuration for different environments.

## Solution Implemented

### 1. Created Centralized Axios Configuration
**File**: `/home/user/webapp/frontend/src/api/axios.js`

This file automatically detects the environment and configures the correct base URL:
- **Sandbox URL**: Detects `sandbox.novita.ai` and replaces `3000-` with `5000-`
- **Localhost**: Uses empty baseURL to leverage proxy configuration
- **Custom**: Respects `REACT_APP_API_URL` environment variable if set

### 2. Updated All Axios Imports
Updated the following files to use the centralized axios configuration:
- `src/App.js`
- `src/pages/PromptExecution.js`
- `src/pages/ChapterView.js`
- `src/pages/ProblemView.js`
- `src/components/Search.js`

### 3. Added Debug Logging
The axios configuration now logs the base URL being used, making it easier to debug connection issues.

## How It Works

### When accessing via Public URL
```
Current URL: https://3000-i5bl6twbq2vcivw6mmr42-18e660f9.sandbox.novita.ai
Backend URL: https://5000-i5bl6twbq2vcivw6mmr42-18e660f9.sandbox.novita.ai
```

### When accessing via Localhost
```
Current URL: http://localhost:3000
Backend URL: http://localhost:5000 (via proxy)
```

## Testing

### Check Console Log
Open browser console and look for:
```
[Axios Config] Base URL: https://5000-i5bl6twbq2vcivw6mmr42-18e660f9.sandbox.novita.ai
```

### Test API Call
1. Navigate to any prompt execution page
2. Fill in the input form
3. Click "Execute"
4. Should see successful API call instead of network error

## Files Modified

1. **Created**: `frontend/src/api/axios.js` - Centralized axios configuration
2. **Modified**: `frontend/src/App.js` - Import from api/axios
3. **Modified**: `frontend/src/pages/PromptExecution.js` - Import from api/axios, removed hardcoded URL
4. **Modified**: `frontend/src/pages/ChapterView.js` - Import from api/axios
5. **Modified**: `frontend/src/pages/ProblemView.js` - Import from api/axios
6. **Modified**: `frontend/src/components/Search.js` - Import from api/axios

## Environment Variables

### Optional Configuration
You can override the automatic detection by setting:

```bash
# In frontend/.env
REACT_APP_API_URL=https://your-custom-backend.com
```

## Benefits

1. ✅ **Automatic Environment Detection**: No manual configuration needed
2. ✅ **Works in All Environments**: Sandbox, localhost, custom deployments
3. ✅ **Debug Friendly**: Console logging shows exactly what URL is being used
4. ✅ **Centralized**: Single source of truth for API configuration
5. ✅ **Flexible**: Can be overridden with environment variables

## Status

✅ **FIX APPLIED AND DEPLOYED**

The changes are live and the frontend should now be able to connect to the backend API when accessed via the public URL.

## Next Time You Access

Simply refresh the browser at:
https://3000-i5bl6twbq2vcivw6mmr42-18e660f9.sandbox.novita.ai

The application should now work correctly with proper API connectivity.
