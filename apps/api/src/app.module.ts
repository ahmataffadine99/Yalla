import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { HealthModule } from './health/health.module';
import { LocationsModule } from './modules/locations/locations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PartnersModule } from './modules/partners/partners.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { SupportModule } from './modules/support/support.module';
import { TripsModule } from './modules/trips/trips.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        API_PORT: Joi.number().integer().min(1).max(65535).default(3000),
        ADMIN_WEB_ORIGIN: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .default('http://localhost:3001'),
        CLIENT_WEB_ORIGIN: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .default('http://localhost:3002'),
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number()
          .integer()
          .min(1)
          .max(65535)
          .default(18081),
        DATABASE_NAME: Joi.string().default('yalla_dev'),
        DATABASE_USER: Joi.string().default('yalla'),
        DATABASE_PASSWORD: Joi.string().min(1).default('yalla_dev_only'),
        ROUTING_BASE_URL: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .allow('')
          .optional(),
        PLACE_NAME_BASE_URL: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .allow('')
          .optional(),
        FARE_BASE_XAF: Joi.number().integer().min(0).default(250),
        FARE_PRICE_PER_KILOMETER_XAF: Joi.number()
          .integer()
          .min(0)
          .default(100),
        FARE_PRICE_PER_MINUTE_XAF: Joi.number()
          .integer()
          .min(0)
          .default(10),
      }),
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DriversModule,
    VehiclesModule,
    TripsModule,
    DispatchModule,
    LocationsModule,
    PricingModule,
    PaymentsModule,
    NotificationsModule,
    SupportModule,
    PartnersModule,
    AdminModule,
    AuditModule,
  ],
})
export class AppModule {}
