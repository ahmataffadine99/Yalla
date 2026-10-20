import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 18081),
  username: process.env.DATABASE_USER ?? 'yalla',
  password: process.env.DATABASE_PASSWORD ?? 'yalla_dev_only',
  database: process.env.DATABASE_NAME ?? 'yalla_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
});
