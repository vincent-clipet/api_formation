import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
	Query,
  } from '@nestjs/common'
  import { Public } from 'src/auth/decorator'
  import { UserService } from '../service/user.service'
  import { User as UserModel } from '@prisma/client'
  const argon2 = require("argon2")

  const salt = "$argon2id$v=19$m=65536,t=3,p=4$";
  
  @Controller('user')
  export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('list')
	async getAllUsers(): Promise<UserModel[]> {
	  const allUsers = await this.userService.user.findMany()
	  return allUsers //this.userService.strip_passwords(allUsers)
	}
  
	@Get(':id')
	async getUserById(@Param('id') id: string): Promise<UserModel> {
		const u = await this.userService.user.findUnique({ 
			where: { id: Number(id)	}
		})
		return this.userService.strip_password(u)
	}

	@Put(':id/setrole')
	async setUserRole(
		@Body() userData: { roleId: number },
		@Param('id') id: string
	): Promise<UserModel> {
	  const u = await this.userService.user.update({
		where: {
		  id: Number(id)
		},
		data: {
			roleId: userData.roleId
		},
	  })
	  return this.userService.strip_password(u)
	}

	@Public()
	@Post('signup')
	async signupUser(
	  @Body() userData: { name: string, password: string },
	): Promise<UserModel> {
	  const hash = await argon2.hash(userData.password)
	  const u = await this.userService.user.create({
		data: {
		  name: userData.name,
		  password: hash.slice(salt.length),
		},
	  })
	  return this.userService.strip_password(u)
	}

	@Delete(':id/delete')
	async deleteUser(
		@Param("id") id: string
	): Promise<UserModel>{
		return this.userService.user.delete({
			where: {id:Number(id)}
		})
	}
  }