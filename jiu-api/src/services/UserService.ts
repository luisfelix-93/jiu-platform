import { MoreThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { Attendance } from "../entities/Attendance";
import { UserRole } from "../entities/User";
import * as bcrypt from "bcrypt";
import { BELT_ORDER_KIDS, BELT_ORDER_ADULT, ADULT_AGE } from "../constants/belt.constants";
import { calculateAge } from "../utils/date.utils";

const userRepository = AppDataSource.getRepository(User);
const profileRepository = AppDataSource.getRepository(Profile);
const attendanceRepository = AppDataSource.getRepository(Attendance);

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
            .select(["user.id", "user.name", "user.beltColor", "user.stripeCount", "user.nextGraduationGoal", "user.avatarUrl", "user.lastGraduationDate"])
            .where("user.role = :role", { role: UserRole.ALUNO })
            .loadRelationCountAndMap("user.attendanceCount", "user.attendances", "attendance", qb =>
                qb.innerJoin("attendance.user", "userAlias")
                  .where("attendance.status = :status", { status: "present" })
                  .andWhere(`"attendance"."created_at" > COALESCE("userAlias"."last_graduation_date", '1970-01-01')`)
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

    static async updateGraduationDate(userId: string, date: Date | null) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");

        user.lastGraduationDate = date;
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

        // Reset graduation cycle: mark the graduation date to the very end of today so today's attendances don't count for the next belt
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        user.lastGraduationDate = now;

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

    static async adjustAttendanceCount(userId: string, newCount: number, adjustedBy: string) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");

        // Build filter: only count attendance after last graduation
        const graduationFilter = user.lastGraduationDate
            ? { userId, status: "present", createdAt: MoreThan(user.lastGraduationDate) }
            : { userId, status: "present" };

        // Get current attendance count (post-graduation only)
        const currentCount = await attendanceRepository.count({ where: graduationFilter });

        const delta = newCount - currentCount;

        if (delta === 0) return { attendanceCount: currentCount, adjusted: 0 };

        if (delta > 0) {
            // Insert manual credit records
            const credits: Partial<Attendance>[] = [];
            for (let i = 0; i < delta; i++) {
                credits.push({
                    userId,
                    lessonId: undefined,
                    status: "present",
                    isManualCredit: true,
                    notes: `Crédito manual adicionado por professor (${adjustedBy})`,
                    checkInTime: new Date(),
                });
            }
            await attendanceRepository.save(credits);
        } else {
            // Remove manual credits (oldest first, post-graduation only)
            const toRemove = Math.abs(delta);
            const manualCreditFilter = user.lastGraduationDate
                ? { userId, isManualCredit: true, createdAt: MoreThan(user.lastGraduationDate) }
                : { userId, isManualCredit: true };

            const manualCredits = await attendanceRepository.find({
                where: manualCreditFilter,
                order: { createdAt: "ASC" },
                take: toRemove,
            });

            if (manualCredits.length < toRemove) {
                throw new Error(
                    `Só é possível remover ${manualCredits.length} créditos manuais. ` +
                    `Presenças reais não podem ser removidas por aqui.`
                );
            }

            await attendanceRepository.remove(manualCredits);
        }

        // Return updated count (post-graduation only)
        const updatedCount = await attendanceRepository.count({ where: graduationFilter });

        return { attendanceCount: updatedCount, adjusted: delta };
    }
}
