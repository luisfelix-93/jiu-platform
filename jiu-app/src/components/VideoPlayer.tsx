import { X } from 'lucide-react';
import { Button } from './ui/Button';

interface VideoPlayerProps {
    src: string;
    title?: string;
    onClose?: () => void;
}

export const VideoPlayer = ({ src, title, onClose }: VideoPlayerProps) => {
    return (
        <div className="bg-black rounded-lg overflow-hidden relative group">
            {onClose && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onClose}
                    type="button"
                    aria-label="Fechar reprodutor de vídeo"
                >
                    <X size={20} />
                </Button>
            )}
            {title && (
                <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-0">
                    <h3 className="text-white font-medium text-lg drop-shadow-md">{title}</h3>
                </div>
            )}
            <video
                className="w-full aspect-video"
                controls
                autoPlay
                controlsList="nodownload"
            >
                <source src={src} type="video/mp4" />
                Seu navegador não suporta a tag de vídeo.
            </video>
        </div>
    );
};
