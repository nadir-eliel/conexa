import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: 'El nombre de usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'La contraseña del usuario',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'El correo electrónico',
  })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsInt({ message: 'El tipo de usuario debe ser un número entero' })
  @IsNotEmpty({ message: 'El tipo de usuario es obligatorio' })
  userTypeId: number;
}
