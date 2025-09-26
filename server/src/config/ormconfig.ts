import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmModule: DataSourceOptions = {
  type: 'mysql',  
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,  
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'nestDB',
  synchronize: false,   
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsRun: false,
};

export const AppDataSource = new DataSource(typeOrmModule);
