const automator = require('miniprogram-automator');

class MiniProgramConsoleMonitor {
  constructor(wsEndpoint = 'ws://localhost:9421') {
    this.wsEndpoint = wsEndpoint;
    this.miniProgram = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      console.log('🔗 正在连接微信小程序自动化服务...');
      console.log(`📡 WebSocket端点: ${this.wsEndpoint}`);

      this.miniProgram = await automator.connect({
        wsEndpoint: this.wsEndpoint,
      });

      this.isConnected = true;
      console.log('✅ 成功连接到微信小程序！');
      console.log('📱 开始监听Console日志...');
      console.log('='.repeat(60));

      await this.setupConsoleListener();
    } catch (error) {
      console.error('❌ 连接失败:', error.message);
      console.log('\n💡 请确保:');
      console.log('1. 微信开发者工具已启动');
      console.log('2. 项目已打开');
      console.log('3. 自动化功能已启用 (端口9421)');
      console.log('4. 在工具设置->安全设置中开启了"服务端口"');
      process.exit(1);
    }
  }

  async setupConsoleListener() {
    try {
      // 监听Console事件
      this.miniProgram.on('console', data => {
        this.handleConsoleLog(data);
      });

      // 监听页面变化
      this.miniProgram.on('pagechange', data => {
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        console.log(
          `\x1b[36m🔄 [${timestamp}] [页面变化] ${data.path || data.url || '未知页面'}\x1b[0m`
        );
        if (data.query && Object.keys(data.query).length > 0) {
          console.log(`\x1b[36m   📋 查询参数: ${JSON.stringify(data.query, null, 2)}\x1b[0m`);
        }
      });

      // 监听错误
      this.miniProgram.on('error', error => {
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        console.log(`\x1b[31m💥 [${timestamp}] [系统错误] ${error.message}\x1b[0m`);
        if (error.stack) {
          console.log(`\x1b[31m📍 [错误堆栈]:\n${error.stack}\x1b[0m`);
        }
      });

      // 监听网络请求（如果支持）
      try {
        this.miniProgram.on('request', data => {
          this.handleNetworkRequest(data);
        });
      } catch (e) {
        console.log('ℹ️ 网络请求监听不可用（需要更新版本的开发者工具）');
      }

      // 监听性能事件（如果支持）
      try {
        this.miniProgram.on('performance', data => {
          this.handlePerformanceLog(data);
        });
      } catch (e) {
        console.log('ℹ️ 性能监听不可用（需要更新版本的开发者工具）');
      }

      console.log('🎯 Console监听器已设置完成');
      console.log('📊 支持的监听类型:');
      console.log('   • Console日志 (log, warn, error, info, debug)');
      console.log('   • 页面变化和路由跳转');
      console.log('   • JavaScript错误和异常');
      console.log('   • 网络请求和响应');
      console.log('   • 性能指标');
      console.log('现在您可以在微信开发者工具中操作小程序，我将实时显示所有详细日志');
    } catch (error) {
      console.error('❌ 设置监听器失败:', error.message);
    }
  }

  handleNetworkRequest(data) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const method = data.method || 'GET';
    const url = data.url || '';
    const status = data.statusCode || data.status;

    let statusIcon = '🌐';
    let statusColor = '\x1b[37m'; // 白色

    if (status >= 200 && status < 300) {
      statusIcon = '✅';
      statusColor = '\x1b[32m'; // 绿色
    } else if (status >= 400) {
      statusIcon = '❌';
      statusColor = '\x1b[31m'; // 红色
    } else if (status >= 300) {
      statusIcon = '🔄';
      statusColor = '\x1b[33m'; // 黄色
    }

    console.log(
      `${statusColor}${statusIcon} [${timestamp}] [网络] ${method} ${url} ${status ? `(${status})` : ''}\x1b[0m`
    );

    if (data.requestData) {
      console.log(
        `${statusColor}   📤 请求数据: ${JSON.stringify(data.requestData, null, 2)}\x1b[0m`
      );
    }

    if (data.responseData) {
      console.log(
        `${statusColor}   📥 响应数据: ${JSON.stringify(data.responseData, null, 2)}\x1b[0m`
      );
    }

    if (data.duration) {
      console.log(`${statusColor}   ⏱️ 耗时: ${data.duration}ms\x1b[0m`);
    }
  }

  handlePerformanceLog(data) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    console.log(`\x1b[35m⚡ [${timestamp}] [性能] ${data.name}: ${data.value}ms\x1b[0m`);

    if (data.detail) {
      console.log(`\x1b[35m   📊 详情: ${JSON.stringify(data.detail, null, 2)}\x1b[0m`);
    }
  }

  handleConsoleLog(data) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    const level = data.type || 'log';

    // 处理参数，支持对象的详细显示
    let formattedArgs = [];
    if (data.args && Array.isArray(data.args)) {
      formattedArgs = data.args.map(arg => this.formatArgument(arg));
    } else if (data.text) {
      formattedArgs = [data.text];
    }

    const message = formattedArgs.join(' ');

    // 根据日志级别使用不同的图标和颜色
    let icon = '📝';
    let prefix = '';

    switch (level.toLowerCase()) {
      case 'error':
        icon = '❌';
        prefix = '\x1b[31m'; // 红色
        break;
      case 'warn':
      case 'warning':
        icon = '⚠️';
        prefix = '\x1b[33m'; // 黄色
        break;
      case 'info':
        icon = 'ℹ️';
        prefix = '\x1b[36m'; // 青色
        break;
      case 'debug':
        icon = '🐛';
        prefix = '\x1b[35m'; // 紫色
        break;
      default:
        icon = '📝';
        prefix = '\x1b[37m'; // 白色
    }

    const resetColor = '\x1b[0m';

    // 显示基本日志
    console.log(`${prefix}${icon} [${timestamp}] [${level.toUpperCase()}] ${message}${resetColor}`);

    // 如果有堆栈信息，显示堆栈
    if (data.stackTrace && data.stackTrace.length > 0) {
      console.log(`${prefix}📍 [堆栈跟踪]:${resetColor}`);
      data.stackTrace.forEach((frame, index) => {
        if (index < 5) {
          // 只显示前5层堆栈
          console.log(
            `${prefix}   ${index + 1}. ${frame.functionName || '<anonymous>'} (${frame.url}:${frame.lineNumber}:${frame.columnNumber})${resetColor}`
          );
        }
      });
    }

    // 特殊处理网络请求
    this.handleNetworkLogs(message, prefix, resetColor);

    // 特殊处理错误
    this.handleErrorLogs(message, data, prefix, resetColor);

    // 添加分隔线（仅对重要日志）
    if (level.toLowerCase() === 'error' || message.includes('API') || message.includes('网络')) {
      console.log(`${prefix}${'─'.repeat(80)}${resetColor}`);
    }
  }

  formatArgument(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);

    // 处理对象和数组
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (error) {
        // 如果JSON.stringify失败（比如循环引用），使用toString
        return arg.toString();
      }
    }

    return String(arg);
  }

  handleNetworkLogs(message, prefix, resetColor) {
    // 检测网络请求
    const networkPatterns = [
      /\b(GET|POST|PUT|DELETE|PATCH)\s+([^\s]+)/i,
      /fetch\(/i,
      /XMLHttpRequest/i,
      /wx\.request/i,
    ];

    for (const pattern of networkPatterns) {
      if (pattern.test(message)) {
        console.log(`🌐 ${prefix}[网络请求] ${message}${resetColor}`);
        break;
      }
    }

    // 检测网络错误
    const errorPatterns = [
      /ERR_CONNECTION_REFUSED/i,
      /ERR_NETWORK/i,
      /ERR_TIMEOUT/i,
      /net::/i,
      /Failed to fetch/i,
      /Network Error/i,
    ];

    for (const pattern of errorPatterns) {
      if (pattern.test(message)) {
        console.log(`🚫 ${prefix}[网络错误] ${message}${resetColor}`);
        break;
      }
    }
  }

  handleErrorLogs(message, data, prefix, resetColor) {
    // 检测常见错误模式
    const errorPatterns = [
      /TypeError/i,
      /ReferenceError/i,
      /SyntaxError/i,
      /RangeError/i,
      /Error:/i,
      /Uncaught/i,
      /Exception/i,
    ];

    for (const pattern of errorPatterns) {
      if (pattern.test(message)) {
        console.log(`💥 ${prefix}[JavaScript错误] ${message}${resetColor}`);

        // 如果有源码位置信息
        if (data.url) {
          console.log(
            `📍 ${prefix}[位置] ${data.url}:${data.lineNumber || '?'}:${data.columnNumber || '?'}${resetColor}`
          );
        }
        break;
      }
    }
  }

  async disconnect() {
    if (this.miniProgram && this.isConnected) {
      try {
        await this.miniProgram.disconnect();
        console.log('👋 已断开连接');
      } catch (error) {
        console.error('断开连接时出错:', error.message);
      }
    }
  }

  // 启动监控
  async start() {
    console.log('🚀 微信小程序Console日志监控器');
    console.log('='.repeat(60));

    // 处理程序退出
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 正在停止监控...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 正在停止监控...');
      await this.disconnect();
      process.exit(0);
    });

    await this.connect();

    // 保持程序运行
    console.log('\n💡 按 Ctrl+C 停止监控');

    // 定期检查连接状态
    setInterval(() => {
      if (!this.isConnected) {
        console.log('⚠️ 连接已断开，尝试重新连接...');
        this.connect();
      }
    }, 10000);
  }
}

// 启动监控器
const monitor = new MiniProgramConsoleMonitor();
monitor.start().catch(error => {
  console.error('启动监控器失败:', error);
  process.exit(1);
});
