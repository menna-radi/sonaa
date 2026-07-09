import { UserDTO } from '../dto/UserDTO';
import { User } from '../../domain/entities/User';

export class UserMapper {
  public static toDomain(dto: UserDTO): User {
    return {
      id: dto.user_id,
      email: dto.email_address,
      name: dto.full_name,
      role: dto.user_role,
      avatarUrl: dto.profile_avatar,
    };
  }

  public static toDTO(entity: User): UserDTO {
    return {
      user_id: entity.id,
      email_address: entity.email,
      full_name: entity.name,
      user_role: entity.role,
      profile_avatar: entity.avatarUrl,
    };
  }
}
