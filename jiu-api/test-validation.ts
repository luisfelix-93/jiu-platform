import { z } from "zod";

enum UserRole {
    ALUNO = "aluno",
    PROFESSOR = "professor",
    ADMIN = "admin",
}

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.nativeEnum(UserRole),
    beltColor: z.string().optional(),
});

const data = {
    name: "Luis Felipe Felix Filho",
    email: "luis.felix.filho@hotmail.com",
    password: "lfcf6493",
    role: "aluno"
};

try {
    const result = registerSchema.parse(data);
    console.log("Validation Successful:", result);
} catch (error) {
    console.error("Validation Failed:", error);
}
