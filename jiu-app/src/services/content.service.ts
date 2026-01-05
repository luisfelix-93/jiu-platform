import api from "../lib/api";

export interface Content {
    id: string;
    title: string;
    description: string;
    contentType: string;
    fileUrl: string;
    lesson?: {
        topic: string;
    };
}

export const ContentService = {
    async listLibrary(filters?: any): Promise<Content[]> {
        const { data } = await api.get("/content/library", { params: filters });
        return data;
    },

    async getLessonContent(lessonId: string): Promise<Content[]> {
        const { data } = await api.get(`/content/lesson/${lessonId}`);
        return data;
    },

    async createContent(data: Partial<Content>): Promise<Content> {
        const { data: newContent } = await api.post("/content", data);
        return newContent;
    }
};
