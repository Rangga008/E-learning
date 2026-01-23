import "reflect-metadata";
import { IsString, IsEmail, MinLength, IsEnum } from "class-validator";
import { UserRole } from "../entities/user.entity";

export class RegisterDto {
	@IsString()
	username: string;

	@IsString()
	@MinLength(6)
	password: string;

	@IsEmail()
	email: string;

	@IsString()
	fullName: string;

	@IsEnum(UserRole)
	role: UserRole;
}
