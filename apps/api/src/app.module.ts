import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(config.get<string>('DATABASE_PORT', '18081')),
        username: config.get<string>('DATABASE_USER', 'yalla'),
        password: config.get<string>('DATABASE_PASSWORD', 'yalla_dev_only'),
        database: config.get<string>('DATABASE_NAME', 'yalla_dev'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    HealthModule,
  ],
})
export class AppModule {}
