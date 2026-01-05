import { AppDataSource } from "../data-source";
import { Class } from "../entities/Class";
import { ClassEnrollment } from "../entities/ClassEnrollment";
import { User } from "../entities/User";

const classRepository = AppDataSource.getRepository(Class);
const enrollmentRepository = AppDataSource.getRepository(ClassEnrollment);
const userRepository = AppDataSource.getRepository(User);

export class ClassService {
    static async createClass(data: any) {
        const newClass = classRepository.create(data);
        return await classRepository.save(newClass);
    }

    static async listClasses() {
        return await classRepository.find({
            relations: ["academy"]
        });
    }

    static async getClassById(id: string) {
        const cls = await classRepository.findOne({
            where: { id },
            relations: ["academy"]
        });
        if (!cls) throw new Error("Class not found");
        return cls;
    }

    static async enrollStudent(classId: string, studentId: string) {
        const cls = await classRepository.findOneBy({ id: classId });
        if (!cls) throw new Error("Class not found");

        const user = await userRepository.findOneBy({ id: studentId });
        if (!user) throw new Error("User not found");

        // Check if already enrolled
        const existing = await enrollmentRepository.findOneBy({ classId, userId: studentId });
        if (existing) throw new Error("Student already enrolled");

        const enrollment = enrollmentRepository.create({
            class: cls,
            user: user
        });

        return await enrollmentRepository.save(enrollment);
    }

    static async getClassStudents(classId: string) {
        return await enrollmentRepository.find({
            where: { classId },
            relations: ["user"]
        });
    }

    static async removeStudent(classId: string, studentId: string) {
        const enrollment = await enrollmentRepository.findOneBy({ classId, userId: studentId });
        if (!enrollment) throw new Error("Enrollment not found");

        return await enrollmentRepository.remove(enrollment);
    }

    static async updateClass(id: string, data: any) {
        const classToUpdate = await classRepository.findOneBy({ id });
        if (!classToUpdate) throw new Error("Class not found");

        // Object.assign(classToUpdate, data);
        classRepository.merge(classToUpdate, data);
        return await classRepository.save(classToUpdate);
    }

    static async deleteClass(id: string) {
        const classToDelete = await classRepository.findOneBy({ id });
        if (!classToDelete) throw new Error("Class not found");

        return await classRepository.remove(classToDelete);
    }
}
