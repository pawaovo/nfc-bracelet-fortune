➜ ~ pm2 logs bracelet-api --lines 200
[TAILING] Tailing last 200 lines for [bracelet-api] process (change the value with --lines option)
/home/xiaoyi-dev1/.pm2/logs/bracelet-api-out.log last 200 lines:
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:55 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:55 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'AUTHENTICATED',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:59 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:59 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:59 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:59 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:59 PM LOG [AuthService] NFC VIRTUAL_NFC_1762786972305_E3GG1D already bound to current user 6cfe285e-4bb4-4bf0-98f4-988ef6a84a74
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:59 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:02:59 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'AUTHENTICATED',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:03:00 PM LOG [FortunesController] Getting today's fortune for user 6cfe285e-4bb4-4bf0-98f4-988ef6a84a74
0|bracelet | [Nest] 235877 - 11/10/2025, 11:03:00 PM LOG [FortunesService] Generating new fortune for user 6cfe285e-4bb4-4bf0-98f4-988ef6a84a74 on 2025-11-10
0|bracelet | [Nest] 235877 - 11/10/2025, 11:03:36 PM LOG [FortunesController] Getting fortune history for user 6cfe285e-4bb4-4bf0-98f4-988ef6a84a74, page 1, limit 20
0|bracelet | [Nest] 235877 - 11/10/2025, 11:03:39 PM LOG [FortunesController] Getting fortune history for user 6cfe285e-4bb4-4bf0-98f4-988ef6a84a74, page 1, limit 20
0|bracelet | [Nest] 235877 - 11/10/2025, 11:03:46 PM LOG [FortunesController] Getting fortune history for user b7023ba1-2aff-45da-af99-9edf04ee3300, page 1, limit 20
0|bracelet | [Nest] 235877 - 11/10/2025, 11:08:48 PM LOG [FortunesController] Getting fortune history for user b7023ba1-2aff-45da-af99-9edf04ee3300, page 1, limit 20
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:07 PM LOG [AuthController] NFC verification request
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:07 PM LOG [AuthController] Object(2) {
0|bracelet | userId: '6cfe285e-4bb4-4bf0-98f4-988ef6a84a74',
0|bracelet | nfcId: 'VIRTUAL_NFC_1762786972305_E3GG1D'
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:07 PM LOG [AuthController] NFC verification request
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:07 PM LOG [AuthController] Object(2) {
0|bracelet | userId: '6cfe285e-4bb4-4bf0-98f4-988ef6a84a74',
0|bracelet | nfcId: 'VIRTUAL_NFC_1762786972305_E3GG1D'
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:07 PM LOG [AuthService] NFC VIRTUAL_NFC_1762786972305_E3GG1D is unbound, binding to user 6cfe285e-4bb4-4bf0-98f4-988ef6a84a74
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:08 PM LOG [AuthService] NFC VIRTUAL_NFC_1762786972305_E3GG1D is unbound, binding to user 6cfe285e-4bb4-4bf0-98f4-988ef6a84a74
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [UsersService] Created new user: d59c2e07-4302-4dde-9535-7a13d0c600e7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [BraceletsService] Bound bracelet VIRTUAL_NFC_1762786972305_E3GG1D to user d59c2e07-4302-4dde-9535-7a13d0c600e7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [AuthService] Successfully bound NFC VIRTUAL_NFC_1762786972305_E3GG1D to user d59c2e07-4302-4dde-9535-7a13d0c600e7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:13 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'PROFILE_INCOMPLETE',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:23 PM LOG [ProfileController] Update profile request
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:23 PM LOG [ProfileController] Object(3) {
0|bracelet | userId: 'd59c2e07-4302-4dde-9535-7a13d0c600e7',
0|bracelet | name: 'Vicodin',
0|bracelet | hasBirthday: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:23 PM LOG [ProfileService] Updating profile for user d59c2e07-4302-4dde-9535-7a13d0c600e7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:23 PM LOG [ProfileService] UpdateProfileDto {
0|bracelet | name: 'Vicodin',
0|bracelet | birthday: '2025-11-10'
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:23 PM LOG [ProfileService] Profile updated successfully for user d59c2e07-4302-4dde-9535-7a13d0c600e7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:23 PM LOG [ProfileController] Profile updated successfully
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:23 PM LOG [ProfileController] Object(2) {
0|bracelet | userId: 'd59c2e07-4302-4dde-9535-7a13d0c600e7',
0|bracelet | updatedFields: [
0|bracelet | 'name',
0|bracelet | 'birthday'
0|bracelet | ]
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:13:30 PM LOG [FortunesController] Getting fortune history for user d59c2e07-4302-4dde-9535-7a13d0c600e7, page 1, limit 20
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [UsersService] Created new user: 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [BraceletsService] Created new bracelet: 6cfc5741-5f78-4743-a8ed-96221cf62420 with nfcId: VIRTUAL_NFC_1762787761593_20ZUU9
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [BraceletsService] Bound bracelet VIRTUAL_NFC_1762787761593_20ZUU9 to user 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthService] Successfully bound NFC VIRTUAL_NFC_1762787761593_20ZUU9 to user 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'PROFILE_INCOMPLETE',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthService] NFC VIRTUAL_NFC_1762787761593_20ZUU9 already bound to current user 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:03 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'PROFILE_INCOMPLETE',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:16 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:16 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:16 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:16 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:16 PM LOG [AuthService] NFC VIRTUAL_NFC_1762787761593_20ZUU9 already bound to current user 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:16 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:16 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'PROFILE_INCOMPLETE',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:27 PM LOG [ProfileController] Update profile request
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:27 PM LOG [ProfileController] Object(3) {
0|bracelet | userId: '3dd21994-409a-4073-8878-e4e4d44053d7',
0|bracelet | name: 'Vicodin',
0|bracelet | hasBirthday: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:27 PM LOG [ProfileService] Updating profile for user 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:27 PM LOG [ProfileService] UpdateProfileDto {
0|bracelet | name: 'Vicodin',
0|bracelet | birthday: '2025-11-10'
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:27 PM LOG [ProfileService] Profile updated successfully for user 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:27 PM LOG [ProfileController] Profile updated successfully
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:27 PM LOG [ProfileController] Object(2) {
0|bracelet | userId: '3dd21994-409a-4073-8878-e4e4d44053d7',
0|bracelet | updatedFields: [
0|bracelet | 'name',
0|bracelet | 'birthday'
0|bracelet | ]
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:29 PM LOG [FortunesController] Getting today's fortune for user 3dd21994-409a-4073-8878-e4e4d44053d7
0|bracelet | [Nest] 235877 - 11/10/2025, 11:16:29 PM LOG [FortunesService] Generating new fortune for user 3dd21994-409a-4073-8878-e4e4d44053d7 on 2025-11-10
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [UsersService] Created new user: 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [BraceletsService] Created new bracelet: 67a607ca-6127-4595-b487-7c63c02b6475 with nfcId: VIRTUAL_NFC_1762788005874_RSRSJF
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [BraceletsService] Bound bracelet VIRTUAL_NFC_1762788005874_RSRSJF to user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthService] Successfully bound NFC VIRTUAL_NFC_1762788005874_RSRSJF to user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'PROFILE_INCOMPLETE',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthService] NFC VIRTUAL_NFC_1762788005874_RSRSJF already bound to current user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:06 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'PROFILE_INCOMPLETE',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:14 PM LOG [AuthController] Login request received
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:14 PM LOG [AuthController] Object(2) {
0|bracelet | hasCode: true,
0|bracelet | hasNfcId: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:14 PM LOG [WeChatService] Successfully got WeChat session for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:14 PM LOG [AuthService] WeChat login for openid: omN1u167...
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:14 PM LOG [AuthService] NFC VIRTUAL_NFC_1762788005874_RSRSJF already bound to current user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:14 PM LOG [AuthController] Login successful
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:14 PM LOG [AuthController] Object(2) {
0|bracelet | status: 'PROFILE_INCOMPLETE',
0|bracelet | hasToken: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:24 PM LOG [ProfileController] Update profile request
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:24 PM LOG [ProfileController] Object(3) {
0|bracelet | userId: '19614ea3-99ca-4dd6-bd9a-6aa38d3c100b',
0|bracelet | name: 'Vicodin',
0|bracelet | hasBirthday: true
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:24 PM LOG [ProfileService] Updating profile for user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:24 PM LOG [ProfileService] UpdateProfileDto {
0|bracelet | name: 'Vicodin',
0|bracelet | birthday: '2025-11-10'
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:24 PM LOG [ProfileService] Profile updated successfully for user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:24 PM LOG [ProfileController] Profile updated successfully
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:24 PM LOG [ProfileController] Object(2) {
0|bracelet | userId: '19614ea3-99ca-4dd6-bd9a-6aa38d3c100b',
0|bracelet | updatedFields: [
0|bracelet | 'name',
0|bracelet | 'birthday'
0|bracelet | ]
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:26 PM LOG [FortunesController] Getting today's fortune for user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:26 PM LOG [FortunesService] Generating new fortune for user 19614ea3-99ca-4dd6-bd9a-6aa38d3c100b on 2025-11-10

/home/xiaoyi-dev1/.pm2/logs/bracelet-api-error.log last 200 lines:
0|bracelet | incoming: null,
0|bracelet | outgoing: [Circular *3],
0|bracelet | maxHeaderPairs: 2000,
0|bracelet | _consumed: false,
0|bracelet | onIncoming: [Function: parserOnIncomingClient],
0|bracelet | joinDuplicateHeaders: undefined,
0|bracelet | Symbol(resource_symbol): HTTPClientAsyncResource {
0|bracelet | type: 'HTTPINCOMINGMESSAGE',
0|bracelet | req: [Circular *3]
0|bracelet | }
0|bracelet | },
0|bracelet | \_httpMessage: [Circular *3],
0|bracelet | Symbol(alpncallback): null,
0|bracelet | Symbol(res): TLSWrap {
0|bracelet | \_parent: TCP {
0|bracelet | reading: [Getter/Setter],
0|bracelet | onconnection: null,
0|bracelet | Symbol(owner_symbol): [Circular *1]
0|bracelet | },
0|bracelet | \_parentWrap: null,
0|bracelet | \_secureContext: SecureContext {
0|bracelet | context: SecureContext {}
0|bracelet | },
0|bracelet | reading: true,
0|bracelet | onkeylog: [Function: onkeylog],
0|bracelet | onhandshakestart: [Function: noop],
0|bracelet | onhandshakedone: [Function (anonymous)],
0|bracelet | onocspresponse: [Function: onocspresponse],
0|bracelet | onnewsession: [Function: onnewsessionclient],
0|bracelet | onerror: [Function: onerror],
0|bracelet | Symbol(owner_symbol): [Circular *1]
0|bracelet | },
0|bracelet | Symbol(verified): true,
0|bracelet | Symbol(pendingSession): null,
0|bracelet | Symbol(async_id_symbol): 4883,
0|bracelet | Symbol(kHandle): TLSWrap {
0|bracelet | \_parent: TCP {
0|bracelet | reading: [Getter/Setter],
0|bracelet | onconnection: null,
0|bracelet | Symbol(owner_symbol): [Circular *1]
0|bracelet | },
0|bracelet | \_parentWrap: null,
0|bracelet | \_secureContext: SecureContext {
0|bracelet | context: SecureContext {}
0|bracelet | },
0|bracelet | reading: true,
0|bracelet | onkeylog: [Function: onkeylog],
0|bracelet | onhandshakestart: [Function: noop],
0|bracelet | onhandshakedone: [Function (anonymous)],
0|bracelet | onocspresponse: [Function: onocspresponse],
0|bracelet | onnewsession: [Function: onnewsessionclient],
0|bracelet | onerror: [Function: onerror],
0|bracelet | Symbol(owner_symbol): [Circular *1]
0|bracelet | },
0|bracelet | Symbol(lastWriteQueueSize): 0,
0|bracelet | Symbol(timeout): Timeout {
0|bracelet | \_idleTimeout: 30000,
0|bracelet | \_idlePrev: [Timeout],
0|bracelet | \_idleNext: [TimersList],
0|bracelet | \_idleStart: 89111059,
0|bracelet | \_onTimeout: [Function: bound ],
0|bracelet | \_timerArgs: undefined,
0|bracelet | \_repeat: null,
0|bracelet | \_destroyed: false,
0|bracelet | Symbol(refed): false,
0|bracelet | Symbol(kHasPrimitive): false,
0|bracelet | Symbol(asyncId): 4893,
0|bracelet | Symbol(triggerId): 4887,
0|bracelet | Symbol(kAsyncContextFrame): undefined
0|bracelet | },
0|bracelet | Symbol(kBuffer): null,
0|bracelet | Symbol(kBufferCb): null,
0|bracelet | Symbol(kBufferGen): null,
0|bracelet | Symbol(shapeMode): true,
0|bracelet | Symbol(kCapture): false,
0|bracelet | Symbol(kSetNoDelay): false,
0|bracelet | Symbol(kSetKeepAlive): true,
0|bracelet | Symbol(kSetKeepAliveInitialDelay): 60,
0|bracelet | Symbol(kBytesRead): 0,
0|bracelet | Symbol(kBytesWritten): 0,
0|bracelet | Symbol(connect-options): {
0|bracelet | rejectUnauthorized: true,
0|bracelet | ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
0|bracelet | checkServerIdentity: [Function: checkServerIdentity],
0|bracelet | minDHSize: 1024,
0|bracelet | maxRedirects: 21,
0|bracelet | maxBodyLength: Infinity,
0|bracelet | protocol: 'https:',
0|bracelet | path: null,
0|bracelet | method: 'POST',
0|bracelet | headers: [Object: null prototype] {
0|bracelet | Accept: 'application/json, text/plain, */*',
0|bracelet | 'Content-Type': 'application/json',
0|bracelet | Authorization: 'Bearer 732372aa-8401-4d91-b9c2-47726252d6ee',
0|bracelet | 'User-Agent': 'axios/1.12.2',
0|bracelet | 'Content-Length': '2852',
0|bracelet | 'Accept-Encoding': 'gzip, compress, deflate, br'
0|bracelet | },
0|bracelet | agents: {
0|bracelet | http: undefined,
0|bracelet | https: undefined
0|bracelet | },
0|bracelet | auth: undefined,
0|bracelet | family: undefined,
0|bracelet | beforeRedirect: [Function: dispatchBeforeRedirect],
0|bracelet | beforeRedirects: {
0|bracelet | proxy: [Function: beforeRedirect]
0|bracelet | },
0|bracelet | hostname: 'ark.cn-beijing.volces.com',
0|bracelet | port: 443,
0|bracelet | agent: undefined,
0|bracelet | nativeProtocols: {
0|bracelet | 'http:': [Object],
0|bracelet | 'https:': [Object]
0|bracelet | },
0|bracelet | pathname: '/api/v3/chat/completions',
0|bracelet | \_defaultAgent: Agent {
0|bracelet | \_events: [Object: null prototype],
0|bracelet | \_eventsCount: 2,
0|bracelet | \_maxListeners: undefined,
0|bracelet | options: [Object: null prototype],
0|bracelet | defaultPort: 443,
0|bracelet | protocol: 'https:',
0|bracelet | requests: [Object: null prototype] {},
0|bracelet | sockets: [Object: null prototype],
0|bracelet | freeSockets: [Object: null prototype] {},
0|bracelet | keepAliveMsecs: 1000,
0|bracelet | keepAlive: true,
0|bracelet | maxSockets: Infinity,
0|bracelet | maxFreeSockets: 256,
0|bracelet | scheduling: 'lifo',
0|bracelet | maxTotalSockets: Infinity,
0|bracelet | totalSocketCount: 1,
0|bracelet | agentKeepAliveTimeoutBuffer: 1000,
0|bracelet | maxCachedSessions: 100,
0|bracelet | \_sessionCache: [Object],
0|bracelet | Symbol(shapeMode): false,
0|bracelet | Symbol(kCapture): false
0|bracelet | },
0|bracelet | host: 'ark.cn-beijing.volces.com',
0|bracelet | keepAlive: true,
0|bracelet | scheduling: 'lifo',
0|bracelet | timeout: 5000,
0|bracelet | proxyEnv: undefined,
0|bracelet | defaultPort: 443,
0|bracelet | noDelay: true,
0|bracelet | servername: 'ark.cn-beijing.volces.com',
0|bracelet | \_agentKey: 'ark.cn-beijing.volces.com:443:::::::::::::::::::::',
0|bracelet | encoding: null,
0|bracelet | keepAliveInitialDelay: 1000
0|bracelet | }
0|bracelet | },
0|bracelet | Symbol(kOutHeaders): [Object: null prototype] {
0|bracelet | accept: [
0|bracelet | 'Accept',
0|bracelet | 'application/json, text/plain, */*'
0|bracelet | ],
0|bracelet | 'content-type': [
0|bracelet | 'Content-Type',
0|bracelet | 'application/json'
0|bracelet | ],
0|bracelet | authorization: [
0|bracelet | 'Authorization',
0|bracelet | 'Bearer 732372aa-8401-4d91-b9c2-47726252d6ee'
0|bracelet | ],
0|bracelet | 'user-agent': [
0|bracelet | 'User-Agent',
0|bracelet | 'axios/1.12.2'
0|bracelet | ],
0|bracelet | 'content-length': [
0|bracelet | 'Content-Length',
0|bracelet | '2852'
0|bracelet | ],
0|bracelet | 'accept-encoding': [
0|bracelet | 'Accept-Encoding',
0|bracelet | 'gzip, compress, deflate, br'
0|bracelet | ],
0|bracelet | host: [
0|bracelet | 'Host',
0|bracelet | 'ark.cn-beijing.volces.com'
0|bracelet | ]
0|bracelet | },
0|bracelet | Symbol(errored): null,
0|bracelet | Symbol(kHighWaterMark): 65536,
0|bracelet | Symbol(kRejectNonStandardBodyWrites): false,
0|bracelet | Symbol(kUniqueHeaders): null
0|bracelet | },
0|bracelet | \_currentUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
0|bracelet | \_timeout: null,
0|bracelet | Symbol(shapeMode): true,
0|bracelet | Symbol(kCapture): false
0|bracelet | }
0|bracelet | }
0|bracelet | [Nest] 235877 - 11/10/2025, 11:20:56 PM ERROR [FortunesController] Failed to get today's fortune: AI_GENERATION_FAILED
0|bracelet | Error: AI_GENERATION_FAILED
0|bracelet | at FortunesService.generateFortuneData (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:2244:15)
0|bracelet | at async FortunesService.getTodayFortune (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:2033:29)
0|bracelet | at async FortunesController.getTodayFortune (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:1752:29)
0|bracelet | at async /home/xiaoyi-dev1/bracelet-fortune/node_modules/.pnpm/@nestjs+core@11.1.7_@nestjs+common@11.1.7_@nestjs+platform-express@11.1.7_reflect-metadata@0.2.2_rxjs@7.8.2/node*modules/@nestjs/core/router/router-execution-context.js:46:28
0|bracelet | at async /home/xiaoyi-dev1/bracelet-fortune/node_modules/.pnpm/@nestjs+core@11.1.7*@nestjs+common@11.1.7_@nestjs+platform-express@11.1.7_reflect-metadata@0.2.2_rxjs@7.8.2/node_modules/@nestjs/core/router/router-proxy.js:9:17
