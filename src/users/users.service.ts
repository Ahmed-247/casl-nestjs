import { Injectable } from '@nestjs/common';
import { CaslAbilityFactory, Action } from '../casl/casl-ability.factory';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly caslAbilityFactory: CaslAbilityFactory
) {}

  someAction(user: User, action: Action) {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.can(action, User)) {
      // perform the action
      return 'Action permitted';
    } else {
      throw new Error('Forbidden');
    }
  }

  async findOrCreateByEmail(email: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = this.userRepository.create({ email, role: 'user' }); // default role
      user = await this.userRepository.save(user);
    }
    return user;
  }

   async createUser(email: string, role: string): Promise<User> {
    const user = this.userRepository.create({ email, role });
    return this.userRepository.save(user);
  }

  // Example user lookup method (adjust as needed for your actual DB calls)
  async findOne(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user === null ? undefined : user;
  }
  async findAll() {
    return await this.userRepository.find();
    
  }
}