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
    },

    async saveContentMetadata(lessonId: string, data: { title: string, description: string, contentType: string, fileUrl: string }): Promise<Content> {
        const { data: newContent } = await api.post(`/content/upload/${lessonId}`, data);
        return newContent;
    },

    async getUploadUrl(fileName: string, contentType: string, lessonId?: string): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
        const { data } = await api.post("/content/upload-url", { fileName, contentType, lessonId });
        return data;
    },

    async uploadFile(uploadUrl: string, file: File): Promise<void> {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
    }
};
