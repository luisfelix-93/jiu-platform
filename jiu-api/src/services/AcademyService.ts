import { AppDataSource } from "../data-source";
import { Academy } from "../entities/Academy";
import { AcademyProfessor, AcademyRole } from "../entities/AcademyProfessor";
import { StudentAcademy } from "../entities/StudentAcademy";
import { User, UserRole } from "../entities/User";
import { In, ILike } from "typeorm";

const academyRepository = AppDataSource.getRepository(Academy);
const academyProfessorRepository = AppDataSource.getRepository(AcademyProfessor);
const studentAcademyRepository = AppDataSource.getRepository(StudentAcademy);
const userRepository = AppDataSource.getRepository(User);

export class AcademyService {
    static async createAcademy(professorId: string, data: { name: string; address: string; phone: string; logoUrl?: string }) {
        const professor = await userRepository.findOneBy({ id: professorId });
        if (!professor) throw new Error("Professor não encontrado");
        if (professor.role !== UserRole.PROFESSOR && professor.role !== UserRole.ADMIN) {
            throw new Error("Apenas professores podem criar academias");
        }

        return AppDataSource.transaction(async (manager) => {
            const academy = manager.create(Academy, {
                name: data.name,
                address: data.address,
                phone: data.phone,
                logoUrl: data.logoUrl || undefined,
            });
            const savedAcademy = await manager.save(academy);

            const link = manager.create(AcademyProfessor, {
                academyId: savedAcademy.id,
                professorId,
                role: AcademyRole.OWNER,
            });
            await manager.save(link);

            return { ...savedAcademy, role: AcademyRole.OWNER };
        });
    }

    static async updateAcademy(academyId: string, professorId: string, data: Partial<{ name: string; address: string; phone: string; logoUrl: string }>) {
        const link = await academyProfessorRepository.findOneBy({ academyId, professorId });
        if (!link) throw new Error("Você não pertence a esta academia");
        if (link.role !== AcademyRole.OWNER) throw new Error("Apenas o owner pode editar a academia");

        const academy = await academyRepository.findOneBy({ id: academyId });
        if (!academy) throw new Error("Academia não encontrada");

        academyRepository.merge(academy, data);
        return await academyRepository.save(academy);
    }

    static async getAcademyById(id: string) {
        const academy = await academyRepository.findOne({
            where: { id },
            relations: ["professors", "professors.professor"],
        });
        if (!academy) throw new Error("Academia não encontrada");

        const studentCount = await studentAcademyRepository.count({
            where: { academyId: id, isActive: true },
        });

        return { ...academy, studentCount };
    }

    static async getAcademiesByUser(userId: string) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("Usuário não encontrado");

        if (user.role === UserRole.PROFESSOR || user.role === UserRole.ADMIN) {
            return this.getAcademiesByProfessor(userId);
        }
        return this.getAcademiesByStudent(userId);
    }

    static async getAcademiesByProfessor(professorId: string) {
        const links = await academyProfessorRepository.find({
            where: { professorId },
            relations: ["academy"],
        });
        return links.map((link) => ({ ...link.academy, role: link.role }));
    }

    static async getAcademiesByStudent(studentId: string) {
        const links = await studentAcademyRepository.find({
            where: { studentId, isActive: true },
            relations: ["academy"],
        });
        return links.map((link) => ({ ...link.academy, enrolledAt: link.enrolledAt }));
    }

    static async searchAcademies(query?: string, page = 1, limit = 20) {
        const where = query ? { name: ILike(`%${query}%`) } : {};
        const [academies, total] = await academyRepository.findAndCount({
            where,
            order: { name: "ASC" },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data: academies, total, page, limit };
    }

    static async addProfessorToAcademy(academyId: string, requesterId: string, targetProfessorId: string) {
        const requesterLink = await academyProfessorRepository.findOneBy({ academyId, professorId: requesterId });
        if (!requesterLink || requesterLink.role !== AcademyRole.OWNER) {
            throw new Error("Apenas o owner pode adicionar professores");
        }

        const existing = await academyProfessorRepository.findOneBy({ academyId, professorId: targetProfessorId });
        if (existing) throw new Error("Professor já pertence a esta academia");

        const professor = await userRepository.findOneBy({ id: targetProfessorId });
        if (!professor) throw new Error("Professor não encontrado");
        if (professor.role !== UserRole.PROFESSOR && professor.role !== UserRole.ADMIN) {
            throw new Error("Usuário não é professor");
        }

        const link = academyProfessorRepository.create({
            academyId,
            professorId: targetProfessorId,
            role: AcademyRole.MEMBER,
        });
        return await academyProfessorRepository.save(link);
    }

    static async removeProfessorFromAcademy(academyId: string, requesterId: string, targetProfessorId: string) {
        const requesterLink = await academyProfessorRepository.findOneBy({ academyId, professorId: requesterId });
        if (!requesterLink || requesterLink.role !== AcademyRole.OWNER) {
            throw new Error("Apenas o owner pode remover professores");
        }

        if (requesterId === targetProfessorId) {
            throw new Error("Owner não pode se remover da própria academia");
        }

        const targetLink = await academyProfessorRepository.findOneBy({ academyId, professorId: targetProfessorId });
        if (!targetLink) throw new Error("Professor não pertence a esta academia");

        return await academyProfessorRepository.remove(targetLink);
    }

    static async enrollStudent(academyId: string, studentId: string) {
        const academy = await academyRepository.findOneBy({ id: academyId });
        if (!academy) throw new Error("Academia não encontrada");

        const student = await userRepository.findOneBy({ id: studentId });
        if (!student) throw new Error("Aluno não encontrado");

        const existing = await studentAcademyRepository.findOneBy({ academyId, studentId });
        if (existing) {
            if (existing.isActive) throw new Error("Aluno já está matriculado nesta academia");
            existing.isActive = true;
            return await studentAcademyRepository.save(existing);
        }

        const link = studentAcademyRepository.create({ academyId, studentId });
        return await studentAcademyRepository.save(link);
    }

    static async unenrollStudent(academyId: string, studentId: string) {
        const link = await studentAcademyRepository.findOneBy({ academyId, studentId });
        if (!link) throw new Error("Aluno não está matriculado nesta academia");

        link.isActive = false;
        return await studentAcademyRepository.save(link);
    }

    static async getAcademyIdsByUser(userId: string): Promise<string[]> {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) return [];

        if (user.role === UserRole.PROFESSOR || user.role === UserRole.ADMIN) {
            const links = await academyProfessorRepository.find({
                where: { professorId: userId },
                select: ["academyId"],
            });
            return links.map((l) => l.academyId);
        }

        const links = await studentAcademyRepository.find({
            where: { studentId: userId, isActive: true },
            select: ["academyId"],
        });
        return links.map((l) => l.academyId);
    }
}
