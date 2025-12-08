import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BraceletsModule } from './bracelets/bracelets.module';
import { ProfileModule } from './profile/profile.module';
import { FortunesModule } from './fortunes/fortunes.module';
import { SmsModule } from './common/sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SmsModule,
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
