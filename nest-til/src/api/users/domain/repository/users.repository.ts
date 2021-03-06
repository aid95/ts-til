import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchUsersDto } from '../../dto';
import { UserDomain } from '../user';
import { UserMapper } from './entities/user.mapper';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  save(userDomain: UserDomain): Promise<UserDomain> {
    return this.repository
      .save(UserMapper.toEntity(userDomain))
      .then(UserMapper.toDomain);
  }

  findById(id: number): Promise<User | undefined> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  findAll(searchUsersDto: SearchUsersDto): Promise<[User[], number]> {
    return this.repository
      .createQueryBuilder('user')
      .offset(+searchUsersDto.page * +searchUsersDto.pageSize)
      .limit(+searchUsersDto.pageSize)
      .getManyAndCount();
  }
}
