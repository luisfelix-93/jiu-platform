import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { UserRole } from "../entities/User";

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
        // Get all students
        const students = await userRepository.find({
            where: { role: UserRole.ALUNO },
            select: ["id", "name", "beltColor", "stripeCount", "nextGraduationGoal", "avatarUrl"]
        });

        // Get attendance counts
        // We can do this via a subquery or separate query. Separate is easier for TypeORM unless strictly optimized.
        // Let's use QueryBuilder to do it in one go if possible, or mapping.

        const studentsWithAttendance = await Promise.all(students.map(async (student) => {
            const attendanceCount = await AppDataSource.getRepository("Attendance").count({
                where: { userId: student.id, status: "present" }
            });

            return {
                ...student,
                attendanceCount
            };
        }));

        return studentsWithAttendance;
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

        const BELT_ORDER_KIDS = ["white", "grey", "yellow", "orange", "green"];
        const BELT_ORDER_ADULT = ["white", "blue", "purple", "brown", "black", "red", "coral"];

        const userBelt = user.beltColor.toLowerCase();

        // Check Age
        let isAdult = false;

        if (user.birthDate) {
            const today = new Date();
            const birthDate = new Date(user.birthDate);

            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age >= 16) isAdult = true;
        }

        // 4 stripes means next step is belt promotion
        if (user.stripeCount >= 4) {

            // Special Rule: White Belt -> Blue Belt if Adult (>= 16)
            if (userBelt === 'white' && isAdult) {
                user.beltColor = 'blue';
                user.stripeCount = 0;
            } else {
                // Standard Progression
                // Use Adult list if Adult and already past white (or if standard logic applies)
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
}
