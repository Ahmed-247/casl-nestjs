import { Controller, Get, Param, Req, ForbiddenException, Post, Body, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CaslAbilityFactory, Action } from '../casl/casl-ability.factory';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

   @Post()
  async create(@Body() createUserDto: { email: string; role?: string }) {
    // Default role to "user" if not provided
    const role = createUserDto.role ?? 'user';
    return this.usersService.createUser(createUserDto.email, role);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req){
      const currentUser = req.user;
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    // This is the critical CASL check!
    if (ability.cannot(Action.Read, 'all')) {
      throw new ForbiddenException('Only admins can see all users');
    }
    return this.usersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    // TODO: Replace with actual user from request (e.g. from JWT)
    const user = await this.usersService.findOne(Number(id)); // demo: fetch by id

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    if (ability.cannot(Action.Read, user)) {
      throw new ForbiddenException('You do not have permission');
    }

    return user;
  }
}