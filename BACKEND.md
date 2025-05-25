# Backend API Documentation

## REST Endpoints

### Authentication

#### Login
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Description**: Authenticate user and return access token
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | grant_type | string | No | OAuth2 grant type |
  | username | string | Yes | User's email address |
  | password | string | Yes | User's password |
  | scope | string | No | OAuth2 scope |
  | client_id | string | No | OAuth2 client ID |
  | client_secret | string | No | OAuth2 client secret |

- **Response**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user_id": "string",
    "email": "user@example.com"
  }
  ```

- **Status Codes**:
  - 200: Successful authentication
  - 401: Invalid credentials
  - 422: Validation error
  - 500: Server error


### Conversation Settings

#### Check Avatar Enabled Status
- **Endpoint**: `/api/conversation/avatar-enabled`
- **Method**: GET
- **Description**: Check if avatar is enabled based on environment variable
- **Parameters**: None
- **Response**:
  ```json
  {
    "avatar_enabled": boolean
  }
  ```
- **Response Details**:
  - `avatar_enabled`: Boolean value
    - `true`: Avatar mode is enabled
    - `false`: Audio-only mode is enabled

- **Status Codes**:
  - 200: Successful response
  - 500: Server error

- **Example Response**:
  ```json
  {
    "avatar_enabled": true
  }
  ```


## WebSocket Connections

### Real-time Chat

#### Connection Details
- **WebSocket Endpoint**: `/api/conversation/webrtc` or `/api/conversation/webrtc/audio`
- **Authentication**: Include token in connection json payload

#### Message Format
```json
{
  "type": "setup",
  "token": "{jwt_token}",
  "param": {
    "startMessage": "string",
    "prompt": "string",
    "avatar": "string",
    "background": "string",
    "voice": "string"
  }
}
```

#### Response Event Types
1. **Status Events**
   ```json
   {
     "type": "status",
     "avatar_uuid": "string"  // Avatar identifier when ready
   }
   ```

2. **WebRTC Events**
   ```json
   {
     "type": "answer",
     "answer": RTCSessionDescription  // WebRTC session description
   }
   ```

3. **Control Events**
   ```json
   {
     "type": "end_call"  // Signals end of conversation
   }
   ```

4. **Avatar Events**
   ```json
   {
     "type": "name",
     "name": "string"  // Avatar name
   }
   ```

5. **State Events**
   ```json
   {
     "type": "thinkingState",
     "thinking": boolean  // Avatar thinking state
   }
   ```

6. **Error Events**
   ```json
   {
     "type": "error",
     "error": "string"  // Error type (e.g., "unauthorized")
   }
   ```

#### Event Handling
- `status`: Indicates avatar is ready with UUID
- `answer`: WebRTC session description for audio setup
- `end_call`: Signals conversation end
- `name`: Provides avatar name
- `thinkingState`: Indicates avatar processing state
- `error`: 
  - `unauthorized`: Redirects to login
  - Other error types may be provided
