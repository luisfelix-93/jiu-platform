import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { UserRole } from "../entities/User";
import * as bcrypt from "bcrypt";
import { BELT_ORDER_KIDS, BELT_ORDER_ADULT, ADULT_AGE } from "../constants/belt.constants";
import { calculateAge } from "../utils/date.utils";

const userRepository = AppDataSource.getRepository(User);
const profileRepository = AppDataSource.getRepository(Profile);

export class UserService {
    static async getProfile(userId: string) {
        const user = await userRepository.findOne({
            where: { id: userId },
            select: ["id", "name", "email", "role", "beltColor", "stripeCount", "avatarUrl", "isActive", "createdAt", "birthDate"],
        });

        if (!user) throw new Error("User not found");

        const profile = await profileRepository.findOneBy({ userId });

        return { ...user, profile };
    }

    static async updateProfile(userId: string, data: any) {
        // Update User fields
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");

        if (data.name) user.name = data.name;
        if (data.birthDate) user.birthDate = new Date(data.birthDate);

        await userRepository.save(user);

        // Update Profile fields
        let profile = await profileRepository.findOneBy({ userId });

        if (!profile) {
            profile = profileRepository.create({ userId });
        }

        const { name, birthDate, ...profileData } = data;
        profileRepository.merge(profile, profileData);
        const savedProfile = await profileRepository.save(profile);

        return { ...user, profile: savedProfile };
    }

    static async listUsers(role?: string) {
        const query = userRepository.createQueryBuilder("user")
            .select(["user.id", "user.name", "user.email", "user.role", "user.beltColor", "user.isActive"]);

        if (role) {
            query.where("user.role = :role", { role });
        }

        return await query.getMany();
    }

    static async listStudentsWithGraduationInfo() {
        const students = await userRepository.createQueryBuilder("user")
            .select(["user.id", "user.name", "user.beltColor", "user.stripeCount", "user.nextGraduationGoal", "user.avatarUrl"])
            .where("user.role = :role", { role: UserRole.ALUNO })
            .loadRelationCountAndMap("user.attendanceCount", "user.attendances", "attendance", qb =>
                qb.where("attendance.status = :status", { status: "present" })
            )
            .getMany();

        return students;
    }

    static async updateGraduationGoal(userId: string, goal: number) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");

        user.nextGraduationGoal = goal;
        return await userRepository.save(user);
    }

    static async promoteStudent(userId: string) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");

        const userBelt = user.beltColor.toLowerCase();

        // Check Age
        let isAdult = false;
        if (user.birthDate) {
            const age = calculateAge(user.birthDate);
            if (age >= ADULT_AGE) isAdult = true;
        }

        // 4 stripes means next step is belt promotion
        if (user.stripeCount >= 4) {

            // Special Rule: White Belt -> Blue Belt if Adult (>= 16)
            if (userBelt === 'white' && isAdult) {
                user.beltColor = 'blue';
                user.stripeCount = 0;
            } else {
                // Standard Progression
                // Use Adult list if Adult
                // Use Kids list if Kid
                const beltList = isAdult ? BELT_ORDER_ADULT : BELT_ORDER_KIDS;

                // Find current belt in the appropriate list
                let currentBeltIndex = beltList.indexOf(userBelt);

                if (currentBeltIndex !== -1 && currentBeltIndex < beltList.length - 1) {
                    user.beltColor = beltList[currentBeltIndex + 1];
                    user.stripeCount = 0;
                } else {
                    // Fallback mechanism if logic fails (e.g. belt not in list)
                    // Just add stripe for safety instead of breaking
                    user.stripeCount = (user.stripeCount || 0) + 1;
                }
            }
        } else {
            // Just add a stripe
            user.stripeCount = (user.stripeCount || 0) + 1;
        }

        const savedUser = await userRepository.save(user);

        return savedUser;
    }

    static async createUser(data: any) {
        const { email, password, name, role, beltColor, stripeCount, birthDate } = data;

        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = userRepository.create({
            email,
            passwordHash,
            name,
            role: role || UserRole.ALUNO,
            beltColor: beltColor || "white",
            stripeCount: stripeCount || 0,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            isActive: true
        });

        await userRepository.save(user);

        // Initialize profile
        const profile = profileRepository.create({ userId: user.id });
        await profileRepository.save(profile);

        const { passwordHash: _, ...result } = user;
        return result;
    }

    static async updateUser(id: string, data: any) {
        const user = await userRepository.findOneBy({ id });
        if (!user) {
            throw new Error("User not found");
        }

        if (data.name) user.name = data.name;
        if (data.role) user.role = data.role;
        if (data.beltColor) user.beltColor = data.beltColor;
        if (data.stripeCount !== undefined) user.stripeCount = data.stripeCount;
        if (data.birthDate) user.birthDate = new Date(data.birthDate);
        if (data.isActive !== undefined) user.isActive = data.isActive;

        if (data.password) {
            user.passwordHash = await bcrypt.hash(data.password, 12);
        }

        await userRepository.save(user);

        const { passwordHash: _, ...result } = user;
        return result;
    }

    static async deleteUser(id: string) {
        const user = await userRepository.findOneBy({ id });
        if (!user) {
            throw new Error("User not found");
        }

        await userRepository.remove(user);
    }
}
