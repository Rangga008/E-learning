import "reflect-metadata";
import { IsString, IsEmail, MinLength } from "class-validator";

export class LoginDto {
	@IsString()
	username: string;

	@IsString()
	@MinLength(6)
	password: string;
}
