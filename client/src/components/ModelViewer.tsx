import { useEffect, useRef } from "react";

type Props = {
    src: string;
    loaded: () => void;
};

export default function ModelViewer({ src, loaded }: Props) {
    const modelViewerRef = useRef<HTMLElement>(null);    

    useEffect(() => {
        const viewer = modelViewerRef.current;

        if (!viewer) return;

        const handleLoad = () => {
            loaded();
        };

        viewer.addEventListener("load", handleLoad);

        return () => {
            viewer.removeEventListener("load", handleLoad);
        };
    }, [loaded]);

    return (
        <model-viewer 
            ref={modelViewerRef}
            className="w-full h-full bg-neutral-800"
            src={src}
            camera-controls 
            touch-action
        />
    );
}
