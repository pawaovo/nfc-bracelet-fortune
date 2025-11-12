import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 设置全局API前缀
  app.setGlobalPrefix('api/v1');

  // 配置静态文件服务（PAG文件）
  // 将 /pag 路径映射到用户目录下的静态文件
  const staticPath =
    process.env.PAG_STATIC_PATH || '/home/xiaoyi-dev1/static/pag';
  app.useStaticAssets(staticPath, {
    prefix: '/pag/',
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Cache-Control', 'public, max-age=2592000'); // 30天缓存
    },
  });
  logger.log(`Static files served from: ${staticPath} at /pag/`);

  // 启用CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  // 监听所有网络接口（0.0.0.0），允许局域网访问
  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API documentation available at: http://localhost:${port}/api/v1`);
  logger.log(`Network access: http://0.0.0.0:${port}`);
}
bootstrap();
