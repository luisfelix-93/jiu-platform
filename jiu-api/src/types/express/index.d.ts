declare namespace Express {
    interface Request {
        user?: {
            userId: string;
            role: string;
            academyIds?: string[];
            [key: string]: any;
        };
    }
}
