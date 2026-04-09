import { z } from "zod";

export const createAcademySchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    address: z.string().min(5, "Endereço deve ter ao menos 5 caracteres"),
    phone: z.string().min(8, "Telefone deve ter ao menos 8 caracteres"),
    logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const updateAcademySchema = createAcademySchema.partial();

export const addProfessorSchema = z.object({
    professorId: z.string().uuid("ID de professor inválido"),
});

export const searchAcademiesSchema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
