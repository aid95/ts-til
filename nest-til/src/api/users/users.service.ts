import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import {
  CreateUserDto,
  CreateUserResponseDto,
  PaginationDto,
  SearchUsersDto,
  UpdateUserDto,
  UserItemDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    return this.usersRepository
      .save(User.of(createUserDto))
      .then(CreateUserResponseDto.from);
  }

  async findAll(
    searchUsersDto: SearchUsersDto,
  ): Promise<PaginationDto<UserItemDto>> {
    const [users, count] = await this.usersRepository.findAll(searchUsersDto);
    return new PaginationDto<UserItemDto>(
      users,
      count,
      searchUsersDto.pageSize,
    );
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findById(id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
