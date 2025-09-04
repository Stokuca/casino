import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { PlayersModule } from './modules/players/players.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BetsModule } from './modules/bets/bets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { OperatorsModule } from './modules/operators/operators.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT!,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
      }),
    }),
    AuthModule,
    PlayersModule,
    WalletModule,
    BetsModule,
    TransactionsModule,
    OperatorsModule
  ],
})
export class AppModule {}
