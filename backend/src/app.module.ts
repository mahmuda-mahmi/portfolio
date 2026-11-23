import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio/portfolio.controller';
import { PortfolioService } from './portfolio/portfolio.service';

@Module({
  imports: [],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class AppModule {}
