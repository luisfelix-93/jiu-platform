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
        return data.data || data;
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

    async uploadFile(
        uploadUrl: string,
        file: File,
        onProgress?: (percent: number, event: ProgressEvent<EventTarget>) => void
    ): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open("PUT", uploadUrl, true);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
                if (event.lengthComputable && typeof onProgress === "function") {
                    const percent = (event.loaded / event.total) * 100;
                    onProgress(percent, event);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error("Upload failed: network error"));
            };

            xhr.onabort = () => {
                reject(new Error("Upload aborted"));
            };

            xhr.send(file);
        });
    }
};
