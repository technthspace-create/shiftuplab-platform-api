import { Body, Controller, Post, HttpCode, HttpStatus } from "@nestjs/common"; import { IsEmail, IsString, MinLength } from "class-validator"; import { AuthService } from "./auth.service";
class LoginDto { @IsEmail() email!:string; @IsString() @MinLength(12) password!:string; }
@Controller("auth") export class AuthController { constructor(private auth:AuthService){} @Post("login") @HttpCode(HttpStatus.OK) login(@Body() body:LoginDto){ return this.auth.login(body.email,body.password); } }
