import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";

const userRepository = AppDataSource.getRepository(User);
const profileRepository = AppDataSource.getRepository(Profile);

export class UserService {
    static async getProfile(userId: string) {
        const user = await userRepository.findOne({
            where: { id: userId },
            select: ["id", "name", "email", "role", "beltColor", "stripeCount", "avatarUrl", "isActive", "createdAt"],
        });

        if (!user) throw new Error("User not found");

        const profile = await profileRepository.findOneBy({ userId });

        return { ...user, profile };
    }

    static async updateProfile(userId: string, data: any) {
        let profile = await profileRepository.findOneBy({ userId });

        if (!profile) {
            profile = profileRepository.create({ userId });
        }

        profileRepository.merge(profile, data);
        return await profileRepository.save(profile);
    }

    static async listUsers(role?: string) {
        const query = userRepository.createQueryBuilder("user")
            .select(["user.id", "user.name", "user.email", "user.role", "user.beltColor", "user.isActive"]);

        if (role) {
            query.where("user.role = :role", { role });
        }

        return await query.getMany();
    }
}
