import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BraceletsModule } from './bracelets/bracelets.module';
import { ProfileModule } from './profile/profile.module';
import { FortunesModule } from './fortunes/fortunes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    BraceletsModule,
    ProfileModule,
    FortunesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
