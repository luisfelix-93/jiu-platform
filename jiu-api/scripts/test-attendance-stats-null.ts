import { AppDataSource } from "../src/data-source";
import { Attendance } from "../src/entities/Attendance";
import { User } from "../src/entities/User";
import { ScheduledLesson } from "../src/entities/ScheduledLesson";
import { Class } from "../src/entities/Class";
import { AttendanceService } from "../src/services/AttendanceService";

async function runTests() {
    console.log("================================================================================");
    console.log("   TESTES DE REGRESSÃO: Estatísticas de Presença (Attendance Stats Null Fix)   ");
    console.log("================================================================================\n");

    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const userRepo = AppDataSource.getRepository(User);

    // Salvar implementações originais caso necessário
    const originalFind = attendanceRepo.find.bind(attendanceRepo);
    const originalFindOne = userRepo.findOne.bind(userRepo);

    let passedTests = 0;
    let totalTests = 0;

    function assert(condition: boolean, message: string) {
        totalTests++;
        if (!condition) {
            console.error(`❌ FALHA: ${message}`);
            throw new Error(`Asserção falhou: ${message}`);
        }
        console.log(`  ✔ ${message}`);
        passedTests++;
    }

    // Mock padrão de usuário para os testes
    const mockUser: Partial<User> = {
        id: "student-uuid-123",
        name: "Carlos Gracie",
        email: "carlos@example.com",
        beltColor: "blue",
        stripeCount: 2,
        nextGraduationGoal: 50,
    };

    userRepo.findOne = async () => mockUser as User;

    try {
        // ---------------------------------------------------------------------
        // CENÁRIO 1 (Sub-fase 3.1): Aluno com 100% de créditos manuais (lessonId: null)
        // ---------------------------------------------------------------------
        console.log("▶ [TEST 1] Aluno com 100% de créditos manuais (lesson: null, isManualCredit: true)...");
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const manualAttendances: Partial<Attendance>[] = [
            {
                id: "att-1",
                userId: "student-uuid-123",
                lessonId: undefined as any,
                lesson: null as any,
                isManualCredit: true,
                status: "present",
                checkInTime: today,
                createdAt: today,
                notes: "Crédito manual 1",
            },
            {
                id: "att-2",
                userId: "student-uuid-123",
                lessonId: undefined as any,
                lesson: null as any,
                isManualCredit: true,
                status: "present",
                checkInTime: yesterday,
                createdAt: yesterday,
                notes: "Crédito manual 2",
            },
            {
                id: "att-3",
                userId: "student-uuid-123",
                lessonId: undefined as any,
                lesson: null as any,
                isManualCredit: true,
                status: "present",
                checkInTime: twoDaysAgo,
                createdAt: twoDaysAgo,
                notes: "Crédito manual 3",
            },
        ];

        attendanceRepo.find = async () => manualAttendances as Attendance[];

        const stats1 = await AttendanceService.getUserAttendanceStats("student-uuid-123");

        assert(stats1.totalClasses === 3, "Total de aulas contabiliza corretamente 3 créditos manuais");
        assert(stats1.streak === 3, "Streak calcula 3 dias consecutivos mesmo sem ScheduledLesson");
        assert(stats1.lastClass !== null, "lastClass não é nulo");
        assert(stats1.lastClass?.className === "Crédito Manual", "lastClass.className exibe 'Crédito Manual'");
        assert(typeof stats1.lastClass?.date === "string", "lastClass.date é retornado como string ISO válida");
        assert(!isNaN(new Date(stats1.lastClass!.date).getTime()), "lastClass.date é interpretável como data válida");
        assert(Array.isArray(stats1.monthlyAttendance), "monthlyAttendance é um array");
        assert(stats1.monthlyAttendance.length === 6, "monthlyAttendance possui os 6 meses");
        assert(stats1.graduation?.remaining === 47, "graduation.remaining calcula meta (50 - 3 = 47)");

        console.log("  ✔ Cenário 1 validado com sucesso.\n");

        // ---------------------------------------------------------------------
        // CENÁRIO 2 (Sub-fase 3.2): Presenças mistas (aulas regulares + créditos manuais)
        // ---------------------------------------------------------------------
        console.log("▶ [TEST 2] Aluno com presenças mistas (aulas regulares + créditos manuais)...");
        const regularClass: Partial<Class> = {
            id: "class-1",
            name: "Jiu-Jitsu Avançado",
        };

        const mixedAttendances: Partial<Attendance>[] = [
            // Mais recente: crédito manual hoje
            {
                id: "att-mixed-1",
                userId: "student-uuid-123",
                lessonId: undefined as any,
                lesson: null as any,
                isManualCredit: true,
                status: "present",
                checkInTime: today,
                createdAt: today,
            },
            // Ontem: aula regular
            {
                id: "att-mixed-2",
                userId: "student-uuid-123",
                lessonId: "lesson-uuid-1",
                lesson: {
                    id: "lesson-uuid-1",
                    date: yesterday.toISOString().split("T")[0],
                    startTime: "19:00",
                    endTime: "20:30",
                    class: regularClass as Class,
                } as ScheduledLesson,
                isManualCredit: false,
                status: "present",
                checkInTime: yesterday,
                createdAt: yesterday,
            },
        ];

        attendanceRepo.find = async () => mixedAttendances as Attendance[];

        const stats2 = await AttendanceService.getUserAttendanceStats("student-uuid-123");

        assert(stats2.totalClasses === 2, "Total de aulas contabiliza corretamente 2 presenças");
        assert(stats2.streak === 2, "Streak calcula continuidade entre crédito manual e aula agendada");
        assert(stats2.lastClass?.className === "Crédito Manual", "lastClass reflete o registro mais recente (Crédito Manual)");

        // Agora invertendo a ordem cronológica para testar quando a aula regular é a mais recente
        const mixedAttendances2: Partial<Attendance>[] = [
            {
                id: "att-mixed-3",
                userId: "student-uuid-123",
                lessonId: "lesson-uuid-2",
                lesson: {
                    id: "lesson-uuid-2",
                    date: today.toISOString().split("T")[0],
                    startTime: "10:00",
                    endTime: "11:30",
                    class: regularClass as Class,
                } as ScheduledLesson,
                isManualCredit: false,
                status: "present",
                checkInTime: today,
                createdAt: today,
            },
            {
                id: "att-mixed-4",
                userId: "student-uuid-123",
                lessonId: undefined as any,
                lesson: null as any,
                isManualCredit: true,
                status: "present",
                checkInTime: yesterday,
                createdAt: yesterday,
            },
        ];

        attendanceRepo.find = async () => mixedAttendances2 as Attendance[];
        const stats2b = await AttendanceService.getUserAttendanceStats("student-uuid-123");

        assert(stats2b.lastClass?.className === "Jiu-Jitsu Avançado", "lastClass reflete o nome da turma quando a aula regular for a mais recente");

        console.log("  ✔ Cenário 2 validado com sucesso.\n");

        // ---------------------------------------------------------------------
        // CENÁRIO 3 (Sub-fase 3.3): Aluno sem nenhuma presença
        // ---------------------------------------------------------------------
        console.log("▶ [TEST 3] Aluno sem nenhuma presença cadastrada...");
        attendanceRepo.find = async () => [] as Attendance[];

        const stats3 = await AttendanceService.getUserAttendanceStats("student-uuid-123");

        assert(stats3.totalClasses === 0, "totalClasses é 0");
        assert(stats3.streak === 0, "streak é 0");
        assert(stats3.lastClass === null, "lastClass é null quando não há presenças");
        assert(stats3.monthlyAttendance.length === 6, "monthlyAttendance possui 6 meses zerados");
        assert(stats3.monthlyAttendance.every(m => m.count === 0), "Todos os meses em monthlyAttendance têm count = 0");
        assert(stats3.graduation?.remaining === 50, "graduation.remaining permanece na meta total");

        console.log("  ✔ Cenário 3 validado com sucesso.\n");

        // ---------------------------------------------------------------------
        // CENÁRIO 4 (Sub-fase 3.4): Validação de Payload e Contrato Frontend
        // ---------------------------------------------------------------------
        console.log("▶ [TEST 4] Validação de contrato e conformidade com AttendanceStats do frontend...");
        attendanceRepo.find = async () => manualAttendances as Attendance[];
        const stats4 = await AttendanceService.getUserAttendanceStats("student-uuid-123");

        const requiredKeys = ["totalClasses", "streak", "lastClass", "monthlyAttendance", "graduation"];
        for (const key of requiredKeys) {
            assert(key in stats4, `Propriedade '${key}' presente no payload retornado`);
        }
        assert(typeof stats4.totalClasses === "number", "totalClasses é number");
        assert(typeof stats4.streak === "number", "streak é number");
        assert(typeof stats4.lastClass?.date === "string", "lastClass.date é string");
        assert(typeof stats4.lastClass?.className === "string", "lastClass.className é string");

        console.log("  ✔ Cenário 4 validado com sucesso.\n");

        console.log("================================================================================");
        console.log(`🎉 RESULTADO: TODOS OS ${passedTests}/${totalTests} TESTES FORAM EXECUTADOS E APROVADOS!`);
        console.log("================================================================================\n");

        process.exit(0);
    } catch (err) {
        console.error("\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES:", err);
        process.exit(1);
    } finally {
        // Restaurar stubs
        attendanceRepo.find = originalFind;
        userRepo.findOne = originalFindOne;
    }
}

runTests();
