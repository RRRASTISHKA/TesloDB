import { Controller,Post, Body, Get, UseGuards, Req, SetMetadata} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'http';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw.headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

    @Get('check-status')
    @Auth()
    checkAuthStatus(@GetUser() user: User){
        return this.authService.checkAuthStatus(user);
    }



  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @Req() request:Express.Request,
    @RawHeaders() rawheaders: string[]
  ){


    return{
      ok:true,
      message: "Hola Mundo Private",
      user,
      userEmail,
      rawheaders
    }
  }
//  @SetMetadata('roles',['admin','super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.admin,ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user:User  
  ){
    return{
      ok:true,
      user
    }
  }




  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user:User  
  ){
    return{
      ok:true,
      user
    }
  }



}
