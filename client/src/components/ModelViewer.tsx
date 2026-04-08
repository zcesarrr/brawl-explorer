import "@google/model-viewer";

type Props = {
    src: string;
};

export default function ModelViewer({ src }: Props) {    
    return (
        <model-viewer 
            className="w-full h-full"
            src={src}
            camera-controls 
            touch-action
        />
    );
}
