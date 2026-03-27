import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';


// Campos que devolvemos al cliente (nunca la contraseña)
const USER_SELECT = {
  id: true,
  email: true,
  telephone: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { firstName, lastName, password, ...rest } = createUserDto;
console.log(createUserDto);
    // Verificamos si el email ya está registrado
    const existing = await this.prisma.user.findUnique({
      where: { email: rest.email },
    });
    if (existing) {
      throw new ConflictException(`El email ${rest.email} ya está en uso`);
    }

    // Combinamos firstName + lastName en el campo "name" del schema
    const name = lastName ? `${firstName} ${lastName}` : firstName;

    // Hasheamos la contraseña (nunca se guarda en texto plano)
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { ...rest, name, password: hashedPassword },
      select: USER_SELECT,
    });
  }


  findAll() {
    return this.prisma.user.findMany({ select: USER_SELECT });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificamos que el usuario existe antes de actualizar
    await this.findOne(id);

    const { firstName, lastName, password, ...rest } = updateUserDto;

    const data: Record<string, unknown> = { ...rest };

    // Si se envía nombre, reconstruimos el campo "name"
    if (firstName) {
      data.name = lastName ? `${firstName} ${lastName}` : firstName;
    }

    // Si se cambia la contraseña, la hasheamos de nuevo
    if (password) {
      data.password = await bcrypt.hash(password, 10);
     }

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  async remove(id: string) {
    // Verificamos que el usuario existe antes de eliminar
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });

    return { message: `Usuario ${id} eliminado correctamente` };
  }
}
