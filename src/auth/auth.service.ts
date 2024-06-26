import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from "bcrypt";
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt.strategy';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  private readonly logger= new Logger('AuthService');
  constructor( @InjectRepository(User)private readonly userRepository:Repository<User>,
                private readonly jwtService:JwtService
){}


  async create(createUserDto: CreateUserDto) {
   try {

    const {password, ...userData} = createUserDto;

    const user = this.userRepository.create({
     ...userData,
     password: bcrypt.hashSync(password, 10)
    });

    await this.userRepository.save(user);
    delete user.password

    return {
      ...user,
      token: this.getJwtToken({id: user.id}) //jwt
    };

   } catch (error) {
    this.handleExceptions(error);

   }
  }


  async login(loginUserDto:LoginUserDto){

    const {password, email} =loginUserDto;

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email:true, password:true, id:true}
    })

    if(!user) throw new UnauthorizedException('Credentials are not (email)');

    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)');

    

    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };

      //TODO return JWT

  }


  async checkAuthStatus(user:User){

    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };

  }


  private getJwtToken(payload:JwtPayload){

    const token = this.jwtService.sign(payload);

    return token;
  }



  private handleExceptions(error:any){
    
    if(error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
}



  
}
