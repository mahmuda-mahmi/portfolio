import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PortfolioService } from './portfolio.service';

@Controller()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'mahmuda-portfolio-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('portfolio')
  getPortfolio() {
    return this.portfolioService.getPortfolioData();
  }

  @Post('contact')
  submitContact(@Body() body: CreateContactDto) {
    return this.portfolioService.submitContact(body);
  }
}
