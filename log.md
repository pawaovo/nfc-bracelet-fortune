0|bracelet-api | [Nest] 325303 - 11/10/2025, 11:34:25 PM LOG [FortunesController] Getting today's fortune for user 5db2e589-1e9e-4893-9e3d-93ad7aa48078
0|bracelet-api | [Nest] 325303 - 11/10/2025, 11:34:25 PM LOG [FortunesService] Generating new fortune for user 5db2e589-1e9e-4893-9e3d-93ad7aa48078 on 2025-11-10
0|bracelet-api | [Nest] 325303 - 11/10/2025, 11:34:55 PM ERROR [AIService] AI call failed after 30004ms: timeout of 30000ms exceeded
0|bracelet-api | [Nest] 325303 - 11/10/2025, 11:34:55 PM ERROR [AIService] Failed to generate fortune with AI
0|bracelet-api | [Nest] 325303 - 11/10/2025, 11:34:55 PM ERROR [AIService] AxiosError: timeout of 30000ms exceeded
0|bracelet-api | at RedirectableRequest.handleRequestTimeout (/home/xiaoyi-dev1/bracelet-fortune/node*modules/.pnpm/axios@1.12.2/node_modules/axios/dist/node/axios.cjs:3363:16)
0|bracelet-api | at RedirectableRequest.emit (node:events:508:28)
0|bracelet-api | at Timeout.<anonymous> (/home/xiaoyi-dev1/bracelet-fortune/node_modules/.pnpm/follow-redirects@1.15.11/node_modules/follow-redirects/index.js:221:12)
0|bracelet-api | at listOnTimeout (node:internal/timers:608:17)
0|bracelet-api | at process.processTimers (node:internal/timers:543:7)
0|bracelet-api | at Axios.request (/home/xiaoyi-dev1/bracelet-fortune/node_modules/.pnpm/axios@1.12.2/node_modules/axios/dist/node/axios.cjs:4483:41)
0|bracelet-api | at async AIService.callAI (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:2841:30)
0|bracelet-api | at async AIService.generateFortune (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:2743:20)
0|bracelet-api | at async FortunesService.tryAIGeneration (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:2261:31)
0|bracelet-api | at async FortunesService.generateFortuneData (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:2236:26)
0|bracelet-api | at async FortunesService.getTodayFortune (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:2033:29)
0|bracelet-api | at async FortunesController.getTodayFortune (/home/xiaoyi-dev1/bracelet-fortune/apps/api/dist/main.js:1752:29)
0|bracelet-api | at async /home/xiaoyi-dev1/bracelet-fortune/node_modules/.pnpm/@nestjs+core@11.1.7*@nestjs+common@11.1.7_@nestjs+platform-express@11.1.7_reflect-metadata@0.2.2_rxjs@7.8.2/node*modules/@nestjs/core/router/router-execution-context.js:46:28
0|bracelet-api | at async /home/xiaoyi-dev1/bracelet-fortune/node_modules/.pnpm/@nestjs+core@11.1.7*@nestjs+common@11.1.7_@nestjs+platform-express@11.1.7_reflect-metadata@0.2.2_rxjs@7.8.2/node_modules/@nestjs/core/router/router-proxy.js:9:17 {
0|bracelet-api | code: 'ECONNABORTED',
0|bracelet-api | config: {
0|bracelet-api | transitional: {
0|bracelet-api | silentJSONParsing: true,
0|bracelet-api | forcedJSONParsing: true,
0|bracelet-api | clarifyTimeoutError: false
0|bracelet-api | },
0|bracelet-api | adapter: [
0|bracelet-api | 'xhr',
0|bracelet-api | 'http',
0|bracelet-api | 'fetch'
0|bracelet-api | ],
0|bracelet-api | transformRequest: [
0|bracelet-api | [Function: transformRequest]
0|bracelet-api | ],
0|bracelet-api | transformResponse: [
0|bracelet-api | [Function: transformResponse]
0|bracelet-api | ],
0|bracelet-api | timeout: 30000,
0|bracelet-api | xsrfCookieName: 'XSRF-TOKEN',
0|bracelet-api | xsrfHeaderName: 'X-XSRF-TOKEN',
0|bracelet-api | maxContentLength: -1,
0|bracelet-api | maxBodyLength: -1,
0|bracelet-api | env: {
0|bracelet-api | FormData: [Function: FormData] [FormData] {
0|bracelet-api | LINE_BREAK: '\r\n',
0|bracelet-api | DEFAULT_CONTENT_TYPE: 'application/octet-stream'
0|bracelet-api | },
0|bracelet-api | Blob: [class Blob]
0|bracelet-api | },
0|bracelet-api | validateStatus: [Function: validateStatus],
0|bracelet-api | headers: Object [AxiosHeaders] {
0|bracelet-api | Accept: 'application/json, text/plain, _/_',
0|bracelet-api | 'Content-Type': 'application/json',
0|bracelet-api | Authorization: 'Bearer 732372aa-8401-4d91-b9c2-47726252d6ee',
0|bracelet-api | 'User-Agent': 'axios/1.12.2',
0|bracelet-api | 'Content-Length': '2852',
0|bracelet-api | 'Accept-Encoding': 'gzip, compress, deflate, br'
0|bracelet-api | },
0|bracelet-api | method: 'post',
0|bracelet-api | url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
0|bracelet-api | data: '{"model":"doubao-seed-1-6-lite-251015","messages":[{"role":"user","content":"你是一位专业的运势分析师，你的任务是结合星盘、运势、玄学知识，根据当日时间和生日为客户生成今日详细运势分析。\\n\\n【重要】输出格式要求：\\n- 必须严格按照下方指定的文本格式输出\\n- 禁止使用JSON格式\\n- 禁止使用其他任何格式\\n- 必须包含所有必需的章节标题和字段\\n\\n今日的日期如下：\\n<today_date>\\n2025-11-10\\n</today_date>\\n用户的生日如下：\\n<user_birthday>\\n11月10日\\n</user_birthday>\\n\\n在进行运势分析时，请遵循以下要求：\\n1. 综合运用星盘、运势、玄学知识进行全面分析。详细且深入地阐述每个方面的运势情况。\\n2. 分析内容应包括事业、财富、爱情三方面。\\n3. 提供的运势分析要详细且具有一定的深度和专业性。\\n4. 根据分析结果进行总结，提供6项数据：事业运星数、财富运星数、爱情运星数、建议、避免事项、今日宜、今日喜用、今日幸运色和幸运数字、综合分数。\\n5. 语言表达要清晰、易懂，避免使用过于晦涩的术语。\\n\\n【重要】星数格式要求：\\n- 星数满分5星，最低0星\\n- 星数必须是0.5的倍数，例如：1、1.5、2、2.5、3、3.5、4、4.5、5\\n- 严禁使用非半星格式，例如：3.7星、4.2星、4.3星等都是错误的\\n- 只允许整星或半星，如3星、3.5星、4星、4.5星\\n\\n【重要】字数限制要求：\\n- 今日宜：必须不超过10个字，例如\\"合作\\"、\\"投资理财\\"\\n- 今日喜用：必须不超过5个字，例如\\"金\\"、\\"水\\"\\n- 今日幸运色：必须不超过10个字，例如\\"蓝色\\"、\\"金黄色\\"\\n- 今日幸运数字：必须是1-2位数字，例如\\"7\\"、\\"12\\"、\\"88\\"\\n\\n【重要】建议和避免事项格式要求：\\n- 建议事项和避免事项：直接写内容，不要分类别（如\\"事业上\\"、\\"财富上\\"等）\\n\\n请严格按照以下文本格式输出你的运势分析（不要使用JSON）：\\n\\n星盘分析:\\n[在此写下星盘分析内容，至少100字]\\n\\n事业运分析:\\n[在此写下事业运分析内容，至少80字]\\n\\n财富运分析:\\n[在此写下财富运分析内容，至少80字]\\n\\n爱情运分析:\\n[在此写下爱情运分析内容，至少80字]\\n\\n总结和建议:\\n事业运星数:[0.5的倍数，如3.5]\\n财富运星数:[0.5的倍数，如4]\\n爱情运星数:[0.5的倍数，如4.5]\\n\\n建议事项:\\n[直接写建议内容]\\n\\n避免事项:\\n[直接写避免内容]\\n\\n其他事项:\\n今日宜:[不超过10字]\\n今日喜用:[不超过10字]\\n今日幸运色:[不超过10字]\\n今日幸运数字:[1-2位数字]\\n今日运势综合数字:[0-100的整数]\\n\\n今日简要总结:[一句话概括]"}],"max_tokens":10000,"temperature":1,"top_p":0.7}',
0|bracelet-api | allowAbsoluteUrls: true
0|bracelet-api | },
0|bracelet-api | request: <ref _4> Writable {
0|bracelet-api | \_events: {
0|bracelet-api | close: undefined,
0|bracelet-api | error: [Function: handleRequestError],
0|bracelet-api | prefinish: undefined,
0|bracelet-api | finish: undefined,
0|bracelet-api | drain: undefined,
0|bracelet-api | response: [Function: handleResponse],
0|bracelet-api | socket: [
0|bracelet-api | [Function: handleRequestSocket],
0|bracelet-api | [Function: destroyOnTimeout]
0|bracelet-api | ],
0|bracelet-api | timeout: undefined,
0|bracelet-api | abort: undefined
0|bracelet-api | },
0|bracelet-api | \_writableState: WritableState {
0|bracelet-api | highWaterMark: 65536,
0|bracelet-api | length: 0,
0|bracelet-api | corked: 0,
0|bracelet-api | onwrite: [Function: bound onwrite],
0|bracelet-api | writelen: 0,
0|bracelet-api | bufferedIndex: 0,
0|bracelet-api | pendingcb: 0,
0|bracelet-api | Symbol(kState): 17580812,
0|bracelet-api | Symbol(kBufferedValue): null
0|bracelet-api | },
0|bracelet-api | \_maxListeners: undefined,
0|bracelet-api | \_options: {
0|bracelet-api | maxRedirects: 21,
0|bracelet-api | maxBodyLength: Infinity,
0|bracelet-api | protocol: 'https:',
0|bracelet-api | path: '/api/v3/chat/completions',
0|bracelet-api | method: 'POST',
0|bracelet-api | headers: [Object: null prototype] {
0|bracelet-api | Accept: 'application/json, text/plain, _/*',
0|bracelet-api | 'Content-Type': 'application/json',
0|bracelet-api | Authorization: 'Bearer 732372aa-8401-4d91-b9c2-47726252d6ee',
0|bracelet-api | 'User-Agent': 'axios/1.12.2',
0|bracelet-api | 'Content-Length': '2852',
0|bracelet-api | 'Accept-Encoding': 'gzip, compress, deflate, br'
0|bracelet-api | },
0|bracelet-api | agents: {
0|bracelet-api | http: undefined,
0|bracelet-api | https: undefined
0|bracelet-api | },
0|bracelet-api | auth: undefined,
0|bracelet-api | family: undefined,
0|bracelet-api | beforeRedirect: [Function: dispatchBeforeRedirect],
0|bracelet-api | beforeRedirects: {
0|bracelet-api | proxy: [Function: beforeRedirect]
0|bracelet-api | },
0|bracelet-api | hostname: 'ark.cn-beijing.volces.com',
0|bracelet-api | port: '',
0|bracelet-api | agent: undefined,
0|bracelet-api | nativeProtocols: {
0|bracelet-api | 'http:': {
0|bracelet-api | \_connectionListener: [Function: connectionListener],
0|bracelet-api | METHODS: [
0|bracelet-api | 'ACL',
0|bracelet-api | 'BIND',
0|bracelet-api | 'CHECKOUT',
0|bracelet-api | 'CONNECT',
0|bracelet-api | 'COPY',
0|bracelet-api | 'DELETE',
0|bracelet-api | 'GET',
0|bracelet-api | 'HEAD',
0|bracelet-api | 'LINK',
0|bracelet-api | 'LOCK',
0|bracelet-api | 'M-SEARCH',
0|bracelet-api | 'MERGE',
0|bracelet-api | 'MKACTIVITY',
0|bracelet-api | 'MKCALENDAR',
0|bracelet-api | 'MKCOL',
0|bracelet-api | 'MOVE',
0|bracelet-api | 'NOTIFY',
0|bracelet-api | 'OPTIONS',
0|bracelet-api | 'PATCH',
0|bracelet-api | 'POST',
0|bracelet-api | 'PROPFIND',
0|bracelet-api | 'PROPPATCH',
0|bracelet-api | 'PURGE',
0|bracelet-api | 'PUT',
0|bracelet-api | 'QUERY',
0|bracelet-api | 'REBIND',
0|bracelet-api | 'REPORT',
0|bracelet-api | 'SEARCH',
0|bracelet-api | 'SOURCE',
0|bracelet-api | 'SUBSCRIBE',
0|bracelet-api | 'TRACE',
0|bracelet-api | 'UNBIND',
0|bracelet-api | 'UNLINK',
0|bracelet-api | 'UNLOCK',
0|bracelet-api | 'UNSUBSCRIBE'
0|bracelet-api | ],
0|bracelet-api | STATUS_CODES: {
0|bracelet-api | '100': 'Continue',
0|bracelet-api | '101': 'Switching Protocols',
0|bracelet-api | '102': 'Processing',
0|bracelet-api | '103': 'Early Hints',
0|bracelet-api | '200': 'OK',
0|bracelet-api | '201': 'Created',
0|bracelet-api | '202': 'Accepted',
0|bracelet-api | '203': 'Non-Authoritative Information',
0|bracelet-api | '204': 'No Content',
0|bracelet-api | '205': 'Reset Content',
0|bracelet-api | '206': 'Partial Content',
0|bracelet-api | '207': 'Multi-Status',
0|bracelet-api | '208': 'Already Reported',
0|bracelet-api | '226': 'IM Used',
0|bracelet-api | '300': 'Multiple Choices',
0|bracelet-api | '301': 'Moved Permanently',
0|bracelet-api | '302': 'Found',
0|bracelet-api | '303': 'See Other',
0|bracelet-api | '304': 'Not Modified',
0|bracelet-api | '305': 'Use Proxy',
0|bracelet-api | '307': 'Temporary Redirect',
0|bracelet-api | '308': 'Permanent Redirect',
0|bracelet-api | '400': 'Bad Request',
0|bracelet-api | '401': 'Unauthorized',
0|bracelet-api | '402': 'Payment Required',
0|bracelet-api | '403': 'Forbidden',
0|bracelet-api | '404': 'Not Found',
0|bracelet-api | '405': 'Method Not Allowed',
0|bracelet-api | '406': 'Not Acceptable',
0|bracelet-api | '407': 'Proxy Authentication Required',
0|bracelet-api | '408': 'Request Timeout',
0|bracelet-api | '409': 'Conflict',
0|bracelet-api | '410': 'Gone',
0|bracelet-api | '411': 'Length Required',
0|bracelet-api | '412': 'Precondition Failed',
0|bracelet-api | '413': 'Payload Too Large',
0|bracelet-api | '414': 'URI Too Long',
0|bracelet-api | '415': 'Unsupported Media Type',
0|bracelet-api | '416': 'Range Not Satisfiable',
0|bracelet-api | '417': 'Expectation Failed',
0|bracelet-api | '418': "I'm a Teapot",
0|bracelet-api | '421': 'Misdirected Request',
0|bracelet-api | '422': 'Unprocessable Entity',
0|bracelet-api | '423': 'Locked',
0|bracelet-api | '424': 'Failed Dependency',
0|bracelet-api | '425': 'Too Early',
0|bracelet-api | '426': 'Upgrade Required',
0|bracelet-api | '428': 'Precondition Required',
0|bracelet-api | '429': 'Too Many Requests',
0|bracelet-api | '431': 'Request Header Fields Too Large',
0|bracelet-api | '451': 'Unavailable For Legal Reasons',
0|bracelet-api | '500': 'Internal Server Error',
0|bracelet-api | '501': 'Not Implemented',
0|bracelet-api | '502': 'Bad Gateway',
0|bracelet-api | '503': 'Service Unavailable',
0|bracelet-api | '504': 'Gateway Timeout',
0|bracelet-api | '505': 'HTTP Version Not Supported',
0|bracelet-api | '506': 'Variant Also Negotiates',
0|bracelet-api | '507': 'Insufficient Storage',
0|bracelet-api | '508': 'Loop Detected',
0|bracelet-api | '509': 'Bandwidth Limit Exceeded',
0|bracelet-api | '510': 'Not Extended',
0|bracelet-api | '511': 'Network Authentication Required'
0|bracelet-api | },
0|bracelet-api | Agent: [Function: Agent] {
0|bracelet-api | defaultMaxSockets: Infinity
0|bracelet-api | },
0|bracelet-api | ClientRequest: [Function: ClientRequest],
0|bracelet-api | IncomingMessage: [Function: IncomingMessage],
0|bracelet-api | OutgoingMessage: [Function: OutgoingMessage],
0|bracelet-api | Server: [Function: Server],
0|bracelet-api | ServerResponse: [Function: ServerResponse],
0|bracelet-api | createServer: [Function: createServer],
0|bracelet-api | validateHeaderName: [Function: validateHeaderName] {
0|bracelet-api | withoutStackTrace: [Function (anonymous)]
0|bracelet-api | },
0|bracelet-api | validateHeaderValue: [Function: validateHeaderValue] {
0|bracelet-api | withoutStackTrace: [Function (anonymous)]
0|bracelet-api | },
0|bracelet-api | get: [Function: get],
0|bracelet-api | request: [Function: request],
0|bracelet-api | setMaxIdleHTTPParsers: [Function: setMaxIdleHTTPParsers],
0|bracelet-api | maxHeaderSize: [Getter],
0|bracelet-api | globalAgent: [Getter/Setter],
0|bracelet-api | WebSocket: [Getter],
0|bracelet-api | CloseEvent: [Getter],
0|bracelet-api | MessageEvent: [Getter]
0|bracelet-api | },
0|bracelet-api | 'https:': {
0|bracelet-api | Agent: [Function: Agent],
0|bracelet-api | globalAgent: Agent {
0|bracelet-api | \_events: [Object: null prototype],
0|bracelet-api | \_eventsCount: 2,
0|bracelet-api | \_maxListeners: undefined,
0|bracelet-api | options: [Object: null prototype],
0|bracelet-api | defaultPort: 443,
0|bracelet-api | protocol: 'https:',
0|bracelet-api | requests: [Object: null prototype] {},
0|bracelet-api | sockets: [Object: null prototype],
0|bracelet-api | freeSockets: [Object: null prototype] {},
0|bracelet-api | keepAliveMsecs: 1000,
0|bracelet-api | keepAlive: true,
0|bracelet-api | maxSockets: Infinity,
0|bracelet-api | maxFreeSockets: 256,
0|bracelet-api | scheduling: 'lifo',
0|bracelet-api | maxTotalSockets: Infinity,
0|bracelet-api | totalSocketCount: 1,
0|bracelet-api | agentKeepAliveTimeoutBuffer: 1000,
0|bracelet-api | maxCachedSessions: 100,
0|bracelet-api | \_sessionCache: [Object],
0|bracelet-api | Symbol(shapeMode): false,
0|bracelet-api | Symbol(kCapture): false
0|bracelet-api | },
0|bracelet-api | Server: [Function: Server],
0|bracelet-api | createServer: [Function: createServer],
0|bracelet-api | get: [Function: get],
0|bracelet-api | request: [Function: request]
0|bracelet-api | }
0|bracelet-api | },
0|bracelet-api | pathname: '/api/v3/chat/completions'
0|bracelet-api | },
0|bracelet-api | \_ended: true,
0|bracelet-api | \_ending: true,
0|bracelet-api | \_redirectCount: 0,
0|bracelet-api | \_redirects: [],
0|bracelet-api | \_requestBodyLength: 2852,
0|bracelet-api | \_requestBodyBuffers: [
0|bracelet-api | {
0|bracelet-api | data: <Buffer 7b 22 6d 6f 64 65 6c 22 3a 22 64 6f 75 62 61 6f 2d 73 65 65 64 2d 31 2d 36 2d 6c 69 74 65 2d 32 35 31 30 31 35 22 2c 22 6d 65 73 73 61 67 65 73 22 3a ... 2802 more bytes>,
0|bracelet-api | encoding: undefined
0|bracelet-api | }
0|bracelet-api | ],
0|bracelet-api | \_eventsCount: 3,
0|bracelet-api | \_onNativeResponse: [Function (anonymous)],
0|bracelet-api | \_currentRequest: <ref *3> ClientRequest {
0|bracelet-api | \_events: [Object: null prototype] {
0|bracelet-api | response: [Function: bound onceWrapper] {
0|bracelet-api | listener: [Function (anonymous)]
0|bracelet-api | },
0|bracelet-api | abort: [Function (anonymous)],
0|bracelet-api | aborted: [Function (anonymous)],
0|bracelet-api | connect: [Function (anonymous)],
0|bracelet-api | error: [Function (anonymous)],
0|bracelet-api | socket: [Function (anonymous)],
0|bracelet-api | timeout: [Function (anonymous)]
0|bracelet-api | },
0|bracelet-api | \_eventsCount: 7,
0|bracelet-api | \_maxListeners: undefined,
0|bracelet-api | outputData: [],
0|bracelet-api | outputSize: 0,
0|bracelet-api | writable: true,
0|bracelet-api | destroyed: false,
0|bracelet-api | \_last: false,
0|bracelet-api | chunkedEncoding: false,
0|bracelet-api | shouldKeepAlive: true,
0|bracelet-api | maxRequestsOnConnectionReached: false,
0|bracelet-api | \_defaultKeepAlive: true,
0|bracelet-api | useChunkedEncodingByDefault: true,
0|bracelet-api | sendDate: false,
0|bracelet-api | \_removedConnection: false,
0|bracelet-api | \_removedContLen: false,
0|bracelet-api | \_removedTE: false,
0|bracelet-api | strictContentLength: false,
0|bracelet-api | \_contentLength: 2852,
0|bracelet-api | \_hasBody: true,
0|bracelet-api | \_trailer: '',
0|bracelet-api | finished: true,
0|bracelet-api | \_headerSent: true,
0|bracelet-api | \_closed: false,
0|bracelet-api | \_header: 'POST /api/v3/chat/completions HTTP/1.1\r\nAccept: application/json, text/plain, _/_\r\nContent-Type: application/json\r\nAuthorization: Bearer 732372aa-8401-4d91-b9c2-47726252d6ee\r\nUser-Agent: axios/1.12.2\r\nContent-Length: 2852\r\nAccept-Encoding: gzip, compress, deflate, br\r\nHost: ark.cn-beijing.volces.com\r\nConnection: keep-alive\r\n\r\n',
0|bracelet-api | \_keepAliveTimeout: 0,
0|bracelet-api | \_onPendingData: [Function: nop],
0|bracelet-api | agent: Agent {
0|bracelet-api | \_events: [Object: null prototype] {
0|bracelet-api | free: [Function (anonymous)],
0|bracelet-api | newListener: [Function: maybeEnableKeylog]
0|bracelet-api | },
0|bracelet-api | \_eventsCount: 2,
0|bracelet-api | \_maxListeners: undefined,
0|bracelet-api | options: [Object: null prototype] {
0|bracelet-api | keepAlive: true,
0|bracelet-api | scheduling: 'lifo',
0|bracelet-api | timeout: 5000,
0|bracelet-api | proxyEnv: undefined,
0|bracelet-api | defaultPort: 443,
0|bracelet-api | protocol: 'https:',
0|bracelet-api | noDelay: true,
0|bracelet-api | path: null
0|bracelet-api | },
0|bracelet-api | defaultPort: 443,
0|bracelet-api | protocol: 'https:',
0|bracelet-api | requests: [Object: null prototype] {},
0|bracelet-api | sockets: [Object: null prototype] {
0|bracelet-api | 'ark.cn-beijing.volces.com:443:::::::::::::::::::::': [
0|bracelet-api | [TLSSocket]
0|bracelet-api | ]
0|bracelet-api | },
0|bracelet-api | freeSockets: [Object: null prototype] {},
0|bracelet-api | keepAliveMsecs: 1000,
0|bracelet-api | keepAlive: true,
0|bracelet-api | maxSockets: Infinity,
0|bracelet-api | maxFreeSockets: 256,
0|bracelet-api | scheduling: 'lifo',
0|bracelet-api | maxTotalSockets: Infinity,
0|bracelet-api | totalSocketCount: 1,
0|bracelet-api | agentKeepAliveTimeoutBuffer: 1000,
0|bracelet-api | maxCachedSessions: 100,
0|bracelet-api | \_sessionCache: {
0|bracelet-api | map: {
0|bracelet-api | 'api.weixin.qq.com:443:::::::::::::::::::::': <Buffer 30 82 09 15 02 01 01 02 02 03 03 04 02 c0 2f 04 20 77 1f b0 7f b7 f4 19 8e 0c eb 48 17 4f d1 20 8b 0c dd fe 1d 53 c8 12 85 04 5a 1f 5d b3 a0 48 2f 04 ... 2279 more bytes>
0|bracelet-api | },
0|bracelet-api | list: [
0|bracelet-api | 'api.weixin.qq.com:443:::::::::::::::::::::'
0|bracelet-api | ]
0|bracelet-api | },
0|bracelet-api | Symbol(shapeMode): false,
0|bracelet-api | Symbol(kCapture): false
0|bracelet-api | },
0|bracelet-api | socketPath: undefined,
0|bracelet-api | method: 'POST',
0|bracelet-api | maxHeaderSize: undefined,
0|bracelet-api | insecureHTTPParser: undefined,
0|bracelet-api | joinDuplicateHeaders: undefined,
0|bracelet-api | path: '/api/v3/chat/completions',
0|bracelet-api | \_ended: false,
0|bracelet-api | res: null,
0|bracelet-api | aborted: false,
0|bracelet-api | timeoutCb: [Function: emitRequestTimeout],
0|bracelet-api | upgradeOrConnect: false,
0|bracelet-api | parser: <ref *2> HTTPParser {
0|bracelet-api | '0': null,
0|bracelet-api | '1': [Function: parserOnHeaders],
0|bracelet-api | '2': [Function: parserOnHeadersComplete],
0|bracelet-api | '3': [Function: parserOnBody],
0|bracelet-api | '4': [Function: parserOnMessageComplete],
0|bracelet-api | '5': null,
0|bracelet-api | '6': null,
0|bracelet-api | \_headers: [],
0|bracelet-api | \_url: '',
0|bracelet-api | socket: <ref *1> TLSSocket {
0|bracelet-api | \_tlsOptions: {
0|bracelet-api | allowHalfOpen: undefined,
0|bracelet-api | pipe: false,
0|bracelet-api | secureContext: [SecureContext],
0|bracelet-api | isServer: false,
0|bracelet-api | requestCert: true,
0|bracelet-api | rejectUnauthorized: true,
0|bracelet-api | session: undefined,
0|bracelet-api | ALPNProtocols: undefined,
0|bracelet-api | requestOCSP: undefined,
0|bracelet-api | enableTrace: undefined,
0|bracelet-api | pskCallback: undefined,
0|bracelet-api | highWaterMark: undefined,
0|bracelet-api | onread: undefined,
0|bracelet-api | signal: undefined
0|bracelet-api | },
0|bracelet-api | \_secureEstablished: true,
0|bracelet-api | \_securePending: false,
0|bracelet-api | \_newSessionPending: false,
0|bracelet-api | \_controlReleased: true,
0|bracelet-api | secureConnecting: false,
0|bracelet-api | \_SNICallback: null,
0|bracelet-api | servername: 'ark.cn-beijing.volces.com',
0|bracelet-api | alpnProtocol: false,
0|bracelet-api | authorized: true,
0|bracelet-api | authorizationError: null,
0|bracelet-api | encrypted: true,
0|bracelet-api | \_events: [Object: null prototype] {
0|bracelet-api | close: [Array],
0|bracelet-api | end: [Array],
0|bracelet-api | error: [Function: socketErrorListener],
0|bracelet-api | newListener: [Function: keylogNewListener],
0|bracelet-api | connect: undefined,
0|bracelet-api | secure: [Function: onConnectSecure],
0|bracelet-api | session: [Function (anonymous)],
0|bracelet-api | free: [Function: onFree],
0|bracelet-api | timeout: [Array],
0|bracelet-api | agentRemove: [Function: onRemove],
0|bracelet-api | data: [Function: socketOnData],
0|bracelet-api | drain: [Function: ondrain]
0|bracelet-api | },
0|bracelet-api | \_eventsCount: 11,
0|bracelet-api | connecting: false,
0|bracelet-api | \_hadError: false,
0|bracelet-api | \_parent: null,
0|bracelet-api | \_host: 'ark.cn-beijing.volces.com',
0|bracelet-api | \_closeAfterHandlingError: false,
0|bracelet-api | \_readableState: ReadableState {
0|bracelet-api | highWaterMark: 65536,
0|bracelet-api | buffer: [],
0|bracelet-api | bufferIndex: 0,
0|bracelet-api | length: 0,
0|bracelet-api | pipes: [],
0|bracelet-api | awaitDrainWriters: null,
0|bracelet-api | Symbol(kState): 193997060
0|bracelet-api | },
0|bracelet-api | \_writableState: WritableState {
0|bracelet-api | highWaterMark: 65536,
0|bracelet-api | length: 0,
0|bracelet-api | corked: 0,
0|bracelet-api | onwrite: [Function: bound onwrite],
0|bracelet-api | writelen: 0,
0|bracelet-api | bufferedIndex: 0,
0|bracelet-api | pendingcb: 0,
0|bracelet-api | Symbol(kState): 17563908,
0|bracelet-api | Symbol(kBufferedValue): null,
0|bracelet-api | Symbol(kWriteCbValue): null
0|bracelet-api | },
0|bracelet-api | allowHalfOpen: false,
0|bracelet-api | \_maxListeners: undefined,
0|bracelet-api | \_sockname: null,
0|bracelet-api | \_pendingData: null,
0|bracelet-api | \_pendingEncoding: '',
0|bracelet-api | server: undefined,
0|bracelet-api | \_server: null,
0|bracelet-api | ssl: TLSWrap {
0|bracelet-api | \_parent: [TCP],
0|bracelet-api | \_parentWrap: null,
0|bracelet-api | \_secureContext: [SecureContext],
0|bracelet-api | reading: true,
0|bracelet-api | onkeylog: [Function: onkeylog],
0|bracelet-api | onhandshakestart: [Function: noop],
0|bracelet-api | onhandshakedone: [Function (anonymous)],
0|bracelet-api | onocspresponse: [Function: onocspresponse],
0|bracelet-api | onnewsession: [Function: onnewsessionclient],
0|bracelet-api | onerror: [Function: onerror],
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | \_requestCert: true,
0|bracelet-api | \_rejectUnauthorized: true,
0|bracelet-api | timeout: 30000,
0|bracelet-api | parser: [Circular *2],
0|bracelet-api | \_httpMessage: [Circular *3],
0|bracelet-api | Symbol(alpncallback): null,
0|bracelet-api | Symbol(res): TLSWrap {
0|bracelet-api | \_parent: [TCP],
0|bracelet-api | \_parentWrap: null,
0|bracelet-api | \_secureContext: [SecureContext],
0|bracelet-api | reading: true,
0|bracelet-api | onkeylog: [Function: onkeylog],
0|bracelet-api | onhandshakestart: [Function: noop],
0|bracelet-api | onhandshakedone: [Function (anonymous)],
0|bracelet-api | onocspresponse: [Function: onocspresponse],
0|bracelet-api | onnewsession: [Function: onnewsessionclient],
0|bracelet-api | onerror: [Function: onerror],
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | Symbol(verified): true,
0|bracelet-api | Symbol(pendingSession): null,
0|bracelet-api | Symbol(async_id_symbol): 270,
0|bracelet-api | Symbol(kHandle): TLSWrap {
0|bracelet-api | \_parent: [TCP],
0|bracelet-api | \_parentWrap: null,
0|bracelet-api | \_secureContext: [SecureContext],
0|bracelet-api | reading: true,
0|bracelet-api | onkeylog: [Function: onkeylog],
0|bracelet-api | onhandshakestart: [Function: noop],
0|bracelet-api | onhandshakedone: [Function (anonymous)],
0|bracelet-api | onocspresponse: [Function: onocspresponse],
0|bracelet-api | onnewsession: [Function: onnewsessionclient],
0|bracelet-api | onerror: [Function: onerror],
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | Symbol(lastWriteQueueSize): 0,
0|bracelet-api | Symbol(timeout): Timeout {
0|bracelet-api | \_idleTimeout: 30000,
0|bracelet-api | \_idlePrev: [Timeout],
0|bracelet-api | \_idleNext: [TimersList],
0|bracelet-api | \_idleStart: 80268,
0|bracelet-api | \_onTimeout: [Function: bound ],
0|bracelet-api | \_timerArgs: undefined,
0|bracelet-api | \_repeat: null,
0|bracelet-api | \_destroyed: false,
0|bracelet-api | Symbol(refed): false,
0|bracelet-api | Symbol(kHasPrimitive): false,
0|bracelet-api | Symbol(asyncId): 280,
0|bracelet-api | Symbol(triggerId): 274,
0|bracelet-api | Symbol(kAsyncContextFrame): undefined
0|bracelet-api | },
0|bracelet-api | Symbol(kBuffer): null,
0|bracelet-api | Symbol(kBufferCb): null,
0|bracelet-api | Symbol(kBufferGen): null,
0|bracelet-api | Symbol(shapeMode): true,
0|bracelet-api | Symbol(kCapture): false,
0|bracelet-api | Symbol(kSetNoDelay): false,
0|bracelet-api | Symbol(kSetKeepAlive): true,
0|bracelet-api | Symbol(kSetKeepAliveInitialDelay): 60,
0|bracelet-api | Symbol(kBytesRead): 0,
0|bracelet-api | Symbol(kBytesWritten): 0,
0|bracelet-api | Symbol(connect-options): {
0|bracelet-api | rejectUnauthorized: true,
0|bracelet-api | ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
0|bracelet-api | checkServerIdentity: [Function: checkServerIdentity],
0|bracelet-api | minDHSize: 1024,
0|bracelet-api | maxRedirects: 21,
0|bracelet-api | maxBodyLength: Infinity,
0|bracelet-api | protocol: 'https:',
0|bracelet-api | path: null,
0|bracelet-api | method: 'POST',
0|bracelet-api | headers: [Object: null prototype],
0|bracelet-api | agents: [Object],
0|bracelet-api | auth: undefined,
0|bracelet-api | family: undefined,
0|bracelet-api | beforeRedirect: [Function: dispatchBeforeRedirect],
0|bracelet-api | beforeRedirects: [Object],
0|bracelet-api | hostname: 'ark.cn-beijing.volces.com',
0|bracelet-api | port: 443,
0|bracelet-api | agent: undefined,
0|bracelet-api | nativeProtocols: [Object],
0|bracelet-api | pathname: '/api/v3/chat/completions',
0|bracelet-api | \_defaultAgent: [Agent],
0|bracelet-api | host: 'ark.cn-beijing.volces.com',
0|bracelet-api | keepAlive: true,
0|bracelet-api | scheduling: 'lifo',
0|bracelet-api | timeout: 5000,
0|bracelet-api | proxyEnv: undefined,
0|bracelet-api | defaultPort: 443,
0|bracelet-api | noDelay: true,
0|bracelet-api | servername: 'ark.cn-beijing.volces.com',
0|bracelet-api | \_agentKey: 'ark.cn-beijing.volces.com:443:::::::::::::::::::::',
0|bracelet-api | encoding: null,
0|bracelet-api | keepAliveInitialDelay: 1000
0|bracelet-api | }
0|bracelet-api | },
0|bracelet-api | incoming: null,
0|bracelet-api | outgoing: [Circular *3],
0|bracelet-api | maxHeaderPairs: 2000,
0|bracelet-api | \_consumed: false,
0|bracelet-api | onIncoming: [Function: parserOnIncomingClient],
0|bracelet-api | joinDuplicateHeaders: undefined,
0|bracelet-api | Symbol(resource_symbol): HTTPClientAsyncResource {
0|bracelet-api | type: 'HTTPINCOMINGMESSAGE',
0|bracelet-api | req: [Circular *3]
0|bracelet-api | }
0|bracelet-api | },
0|bracelet-api | maxHeadersCount: null,
0|bracelet-api | reusedSocket: false,
0|bracelet-api | host: 'ark.cn-beijing.volces.com',
0|bracelet-api | protocol: 'https:',
0|bracelet-api | \_redirectable: [Circular *4],
0|bracelet-api | Symbol(shapeMode): false,
0|bracelet-api | Symbol(kCapture): false,
0|bracelet-api | Symbol(kBytesWritten): 0,
0|bracelet-api | Symbol(kNeedDrain): false,
0|bracelet-api | Symbol(corked): 0,
0|bracelet-api | Symbol(kChunkedBuffer): [],
0|bracelet-api | Symbol(kChunkedLength): 0,
0|bracelet-api | Symbol(kSocket): <ref *1> TLSSocket {
0|bracelet-api | \_tlsOptions: {
0|bracelet-api | allowHalfOpen: undefined,
0|bracelet-api | pipe: false,
0|bracelet-api | secureContext: SecureContext {
0|bracelet-api | context: SecureContext {}
0|bracelet-api | },
0|bracelet-api | isServer: false,
0|bracelet-api | requestCert: true,
0|bracelet-api | rejectUnauthorized: true,
0|bracelet-api | session: undefined,
0|bracelet-api | ALPNProtocols: undefined,
0|bracelet-api | requestOCSP: undefined,
0|bracelet-api | enableTrace: undefined,
0|bracelet-api | pskCallback: undefined,
0|bracelet-api | highWaterMark: undefined,
0|bracelet-api | onread: undefined,
0|bracelet-api | signal: undefined
0|bracelet-api | },
0|bracelet-api | \_secureEstablished: true,
0|bracelet-api | \_securePending: false,
0|bracelet-api | \_newSessionPending: false,
0|bracelet-api | \_controlReleased: true,
0|bracelet-api | secureConnecting: false,
0|bracelet-api | \_SNICallback: null,
0|bracelet-api | servername: 'ark.cn-beijing.volces.com',
0|bracelet-api | alpnProtocol: false,
0|bracelet-api | authorized: true,
0|bracelet-api | authorizationError: null,
0|bracelet-api | encrypted: true,
0|bracelet-api | \_events: [Object: null prototype] {
0|bracelet-api | close: [
0|bracelet-api | [Function: onSocketCloseDestroySSL],
0|bracelet-api | [Function],
0|bracelet-api | [Function: onClose],
0|bracelet-api | [Function: socketCloseListener]
0|bracelet-api | ],
0|bracelet-api | end: [
0|bracelet-api | [Function: onReadableStreamEnd],
0|bracelet-api | [Function: socketOnEnd]
0|bracelet-api | ],
0|bracelet-api | error: [Function: socketErrorListener],
0|bracelet-api | newListener: [Function: keylogNewListener],
0|bracelet-api | connect: undefined,
0|bracelet-api | secure: [Function: onConnectSecure],
0|bracelet-api | session: [Function (anonymous)],
0|bracelet-api | free: [Function: onFree],
0|bracelet-api | timeout: [
0|bracelet-api | [Function: onTimeout],
0|bracelet-api | [Function],
0|bracelet-api | [Function (anonymous)]
0|bracelet-api | ],
0|bracelet-api | agentRemove: [Function: onRemove],
0|bracelet-api | data: [Function: socketOnData],
0|bracelet-api | drain: [Function: ondrain]
0|bracelet-api | },
0|bracelet-api | \_eventsCount: 11,
0|bracelet-api | connecting: false,
0|bracelet-api | \_hadError: false,
0|bracelet-api | \_parent: null,
0|bracelet-api | \_host: 'ark.cn-beijing.volces.com',
0|bracelet-api | \_closeAfterHandlingError: false,
0|bracelet-api | \_readableState: ReadableState {
0|bracelet-api | highWaterMark: 65536,
0|bracelet-api | buffer: [],
0|bracelet-api | bufferIndex: 0,
0|bracelet-api | length: 0,
0|bracelet-api | pipes: [],
0|bracelet-api | awaitDrainWriters: null,
0|bracelet-api | Symbol(kState): 193997060
0|bracelet-api | },
0|bracelet-api | \_writableState: WritableState {
0|bracelet-api | highWaterMark: 65536,
0|bracelet-api | length: 0,
0|bracelet-api | corked: 0,
0|bracelet-api | onwrite: [Function: bound onwrite],
0|bracelet-api | writelen: 0,
0|bracelet-api | bufferedIndex: 0,
0|bracelet-api | pendingcb: 0,
0|bracelet-api | Symbol(kState): 17563908,
0|bracelet-api | Symbol(kBufferedValue): null,
0|bracelet-api | Symbol(kWriteCbValue): null
0|bracelet-api | },
0|bracelet-api | allowHalfOpen: false,
0|bracelet-api | \_maxListeners: undefined,
0|bracelet-api | \_sockname: null,
0|bracelet-api | \_pendingData: null,
0|bracelet-api | \_pendingEncoding: '',
0|bracelet-api | server: undefined,
0|bracelet-api | \_server: null,
0|bracelet-api | ssl: TLSWrap {
0|bracelet-api | \_parent: TCP {
0|bracelet-api | reading: [Getter/Setter],
0|bracelet-api | onconnection: null,
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | \_parentWrap: null,
0|bracelet-api | \_secureContext: SecureContext {
0|bracelet-api | context: SecureContext {}
0|bracelet-api | },
0|bracelet-api | reading: true,
0|bracelet-api | onkeylog: [Function: onkeylog],
0|bracelet-api | onhandshakestart: [Function: noop],
0|bracelet-api | onhandshakedone: [Function (anonymous)],
0|bracelet-api | onocspresponse: [Function: onocspresponse],
0|bracelet-api | onnewsession: [Function: onnewsessionclient],
0|bracelet-api | onerror: [Function: onerror],
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | \_requestCert: true,
0|bracelet-api | \_rejectUnauthorized: true,
0|bracelet-api | timeout: 30000,
0|bracelet-api | parser: <ref *2> HTTPParser {
0|bracelet-api | '0': null,
0|bracelet-api | '1': [Function: parserOnHeaders],
0|bracelet-api | '2': [Function: parserOnHeadersComplete],
0|bracelet-api | '3': [Function: parserOnBody],
0|bracelet-api | '4': [Function: parserOnMessageComplete],
0|bracelet-api | '5': null,
0|bracelet-api | '6': null,
0|bracelet-api | \_headers: [],
0|bracelet-api | \_url: '',
0|bracelet-api | socket: [Circular *1],
0|bracelet-api | incoming: null,
0|bracelet-api | outgoing: [Circular *3],
0|bracelet-api | maxHeaderPairs: 2000,
0|bracelet-api | \_consumed: false,
0|bracelet-api | onIncoming: [Function: parserOnIncomingClient],
0|bracelet-api | joinDuplicateHeaders: undefined,
0|bracelet-api | Symbol(resource_symbol): HTTPClientAsyncResource {
0|bracelet-api | type: 'HTTPINCOMINGMESSAGE',
0|bracelet-api | req: [Circular *3]
0|bracelet-api | }
0|bracelet-api | },
0|bracelet-api | \_httpMessage: [Circular *3],
0|bracelet-api | Symbol(alpncallback): null,
0|bracelet-api | Symbol(res): TLSWrap {
0|bracelet-api | \_parent: TCP {
0|bracelet-api | reading: [Getter/Setter],
0|bracelet-api | onconnection: null,
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | \_parentWrap: null,
0|bracelet-api | \_secureContext: SecureContext {
0|bracelet-api | context: SecureContext {}
0|bracelet-api | },
0|bracelet-api | reading: true,
0|bracelet-api | onkeylog: [Function: onkeylog],
0|bracelet-api | onhandshakestart: [Function: noop],
0|bracelet-api | onhandshakedone: [Function (anonymous)],
0|bracelet-api | onocspresponse: [Function: onocspresponse],
0|bracelet-api | onnewsession: [Function: onnewsessionclient],
0|bracelet-api | onerror: [Function: onerror],
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | Symbol(verified): true,
0|bracelet-api | Symbol(pendingSession): null,
0|bracelet-api | Symbol(async_id_symbol): 270,
0|bracelet-api | Symbol(kHandle): TLSWrap {
0|bracelet-api | \_parent: TCP {
0|bracelet-api | reading: [Getter/Setter],
0|bracelet-api | onconnection: null,
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | \_parentWrap: null,
0|bracelet-api | \_secureContext: SecureContext {
0|bracelet-api | context: SecureContext {}
0|bracelet-api | },
0|bracelet-api | reading: true,
0|bracelet-api | onkeylog: [Function: onkeylog],
0|bracelet-api | onhandshakestart: [Function: noop],
0|bracelet-api | onhandshakedone: [Function (anonymous)],
0|bracelet-api | onocspresponse: [Function: onocspresponse],
0|bracelet-api | onnewsession: [Function: onnewsessionclient],
0|bracelet-api | onerror: [Function: onerror],
0|bracelet-api | Symbol(owner_symbol): [Circular *1]
0|bracelet-api | },
0|bracelet-api | Symbol(lastWriteQueueSize): 0,
0|bracelet-api | Symbol(timeout): Timeout {
0|bracelet-api | \_idleTimeout: 30000,
0|bracelet-api | \_idlePrev: [Timeout],
0|bracelet-api | \_idleNext: [TimersList],
0|bracelet-api | \_idleStart: 80268,
0|bracelet-api | \_onTimeout: [Function: bound ],
0|bracelet-api | \_timerArgs: undefined,
0|bracelet-api | \_repeat: null,
0|bracelet-api | \_destroyed: false,
0|bracelet-api | Symbol(refed): false,
0|bracelet-api | Symbol(kHasPrimitive): false,
0|bracelet-api | Symbol(asyncId): 280,
0|bracelet-api | Symbol(triggerId): 274,
0|bracelet-api | Symbol(kAsyncContextFrame): undefined
0|bracelet-api | },
0|bracelet-api | Symbol(kBuffer): null,
0|bracelet-api | Symbol(kBufferCb): null,
0|bracelet-api | Symbol(kBufferGen): null,
0|bracelet-api | Symbol(shapeMode): true,
0|bracelet-api | Symbol(kCapture): false,
0|bracelet-api | Symbol(kSetNoDelay): false,
0|bracelet-api | Symbol(kSetKeepAlive): true,
0|bracelet-api | Symbol(kSetKeepAliveInitialDelay): 60,
0|bracelet-api | Symbol(kBytesRead): 0,
0|bracelet-api | Symbol(kBytesWritten): 0,
0|bracelet-api | Symbol(connect-options): {
0|bracelet-api | rejectUnauthorized: true,
0|bracelet-api | ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
0|bracelet-api | checkServerIdentity: [Function: checkServerIdentity],
0|bracelet-api | minDHSize: 1024,
0|bracelet-api | maxRedirects: 21,
0|bracelet-api | maxBodyLength: Infinity,
0|bracelet-api | protocol: 'https:',
0|bracelet-api | path: null,
0|bracelet-api | method: 'POST',
0|bracelet-api | headers: [Object: null prototype] {
0|bracelet-api | Accept: 'application/json, text/plain, _/_',
0|bracelet-api | 'Content-Type': 'application/json',
0|bracelet-api | Authorization: 'Bearer 732372aa-8401-4d91-b9c2-47726252d6ee',
0|bracelet-api | 'User-Agent': 'axios/1.12.2',
0|bracelet-api | 'Content-Length': '2852',
0|bracelet-api | 'Accept-Encoding': 'gzip, compress, deflate, br'
0|bracelet-api | },
0|bracelet-api | agents: {
0|bracelet-api | http: undefined,
0|bracelet-api | https: undefined
0|bracelet-api | },
0|bracelet-api | auth: undefined,
0|bracelet-api | family: undefined,
0|bracelet-api | beforeRedirect: [Function: dispatchBeforeRedirect],
0|bracelet-api | beforeRedirects: {
0|bracelet-api | proxy: [Function: beforeRedirect]
0|bracelet-api | },
0|bracelet-api | hostname: 'ark.cn-beijing.volces.com',
0|bracelet-api | port: 443,
0|bracelet-api | agent: undefined,
0|bracelet-api | nativeProtocols: {
0|bracelet-api | 'http:': [Object],
0|bracelet-api | 'https:': [Object]
0|bracelet-api | },
0|bracelet-api | pathname: '/api/v3/chat/completions',
0|bracelet-api | \_defaultAgent: Agent {
0|bracelet-api | \_events: [Object: null prototype],
0|bracelet-api | \_eventsCount: 2,
0|bracelet-api | \_maxListeners: undefined,
0|bracelet-api | options: [Object: null prototype],
0|bracelet-api | defaultPort: 443,
0|bracelet-api | protocol: 'https:',
0|bracelet-api | requests: [Object: null prototype] {},
0|bracelet-api | sockets: [Object: null prototype],
0|bracelet-api | freeSockets: [Object: null prototype] {},
0|bracelet-api | keepAliveMsecs: 1000,
0|bracelet-api | keepAlive: true,
0|bracelet-api | maxSockets: Infinity,
0|bracelet-api | maxFreeSockets: 256,
0|bracelet-api | scheduling: 'lifo',
0|bracelet-api | maxTotalSockets: Infinity,
0|bracelet-api | totalSocketCount: 1,
0|bracelet-api | agentKeepAliveTimeoutBuffer: 1000,
0|bracelet-api | maxCachedSessions: 100,
0|bracelet-api | \_sessionCache: [Object],
0|bracelet-api | Symbol(shapeMode): false,
0|bracelet-api | Symbol(kCapture): false
0|bracelet-api | },
0|bracelet-api | host: 'ark.cn-beijing.volces.com',
0|bracelet-api | keepAlive: true,
0|bracelet-api | scheduling: 'lifo',
0|bracelet-api | timeout: 5000,
0|bracelet-api | proxyEnv: undefined,
0|bracelet-api | defaultPort: 443,
0|bracelet-api | noDelay: true,
0|bracelet-api | servername: 'ark.cn-beijing.volces.com',
0|bracelet-api | \_agentKey: 'ark.cn-beijing.volces.com:443:::::::::::::::::::::',
0|bracelet-api | encoding: null,
0|bracelet-api | keepAliveInitialDelay: 1000
0|bracelet-api | }
0|bracelet-api | },
0|bracelet-api | Symbol(kOutHeaders): [Object: null prototype] {
0|bracelet-api | accept: [
0|bracelet-api | 'Accept',
0|bracelet-api | 'application/json, text/plain, */*'
0|bracelet-api | ],
0|bracelet-api | 'content-type': [
0|bracelet-api | 'Content-Type',
0|bracelet-api | 'application/json'
0|bracelet-api | ],
0|bracelet-api | authorization: [
0|bracelet-api | 'Authorization',
0|bracelet-api | 'Bearer 732372aa-8401-4d91-b9c2-47726252d6ee'
0|bracelet-api | ],
0|bracelet-api | 'user-agent': [
0|bracelet-api | 'User-Agent',
0|bracelet-api | 'axios/1.12.2'
0|bracelet-api | ],
0|bracelet-api | 'content-length': [
0|bracelet-api | 'Content-Length',
0|bracelet-api | '2852'
0|bracelet-api | ],
0|bracelet-api | 'accept-encoding': [
0|bracelet-api | 'Accept-Encoding',
0|bracelet-api | 'gzip, compress, deflate, br'
0|bracelet-api | ],
0|bracelet-api | host: [
0|bracelet-api | 'Host',
0|bracelet-api | 'ark.cn-beijing.volces.com'
0|bracelet-api | ]
0|bracelet-api | },
0|bracelet-api | Symbol(errored): null,
0|bracelet-api | Symbol(kHighWaterMark): 65536,
0|bracelet-api | Symbol(kRejectNonStandardBodyWrites): false,
0|bracelet-api | Symbol(kUniqueHeaders): null
0|bracelet-api | },
0|bracelet-api | \_currentUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
0|bracelet-api | \_timeout: null,
0|bracelet-api | Symbol(shapeMode): true,
0|bracelet-api | Symbol(kCapture): false
0|bracelet-api | }
0|bracelet-api | }
0|bracelet-api | [Nest] 325303 - 11/10/2025, 11:34:55 PM WARN [FortunesService] AI generation failed, using fallback fortune template
