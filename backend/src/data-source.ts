import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // VAŽNO: putanja da pokupi SVE entitete
  entities: [__dirname + '/**/*.entity.{ts,js}'],

  // Putanja za migracije
  migrations: [__dirname + '/migrations/*.{ts,js}'],

  // U runtime AppModule koristiš autoLoadEntities i migrationsRun, ali ovde je bitno za CLI
  synchronize: false,
  logging: false,
});
