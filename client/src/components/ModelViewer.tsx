import type { FileOutput } from "@/types/models.types";
import { useEffect, useRef } from "react";

type ModelViewerProps = {
    src: string;
    loaded: () => void;
    textureData: FileOutput | null;
};

export default function ModelViewer({ src, loaded, textureData }: ModelViewerProps) {
    const modelViewerRef = useRef<any>(null);

    useEffect(() => {
        const viewer = modelViewerRef.current;

        if (!viewer) return;

        const handleLoad = async () => {
            loaded();
        };

        viewer.addEventListener("load", handleLoad);

        return () => {
            viewer.removeEventListener("load", handleLoad);
        };
    }, [loaded]);

    useEffect(() => {
        if (!textureData) return;

        const viewer = modelViewerRef.current;

        if (!viewer) return;

        const loadTexture = async () => {
            const materials = viewer.model.materials;
            const texture = await viewer.createTexture(textureData.uri);

            for (let i = 0; i < materials.length; i ++) {
                materials[i].pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
        }

        loadTexture();
    }, [textureData]);

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