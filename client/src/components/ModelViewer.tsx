import type { FileOutput } from "@/types/models.types";
import { useEffect, useRef, useState } from "react";

let modelViewerLoader: Promise<unknown> | null = null;

function loadModelViewerOnce() {
    if (!modelViewerLoader) {
        modelViewerLoader = import("@google/model-viewer/dist/model-viewer");
    }

    return modelViewerLoader;
}

type ModelViewerProps = {
    src: string;
    loaded: (materials: string[]) => void;
    textureData: FileOutput | null;
};

export default function ModelViewer({ src, loaded, textureData }: ModelViewerProps) {
    const modelViewerRef = useRef<any>(null);
    const [viewerReady, setViewerReady] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;

        loadModelViewerOnce()
            .then(() => {
                if (mounted) setViewerReady(true);
            })
            .catch((err) => {
                console.error("Failed to load @google/model-viewer", err);
            });
        
        return () => {
            mounted = false;
        }
    }, []);

    useEffect(() => {
        const viewer = modelViewerRef.current;

        if (!viewer) return;

        const handleLoad = async () => {
            loaded(viewer.model.materials.map((item: any) => item.name));
        };

        viewer.addEventListener("load", handleLoad);

        return () => {
            viewer.removeEventListener("load", handleLoad);
        };
    }, [loaded]);

    useEffect(() => {
        if (!viewerReady) return;

        const viewer = modelViewerRef.current;
        if (!viewer) return;

        const handleLoad = () => loaded(viewer.model.materials.map((item: any) => item.name));

        viewer.addEventListener("load", handleLoad);
        return () => viewer.removeEventListener("load", handleLoad);
    }, [viewerReady, loaded]);

    useEffect(() => {
        if (!viewerReady || !textureData) return;

        const viewer = modelViewerRef.current;
        if (!viewer?.model?.materials) return;

        let cancelled = false;

        const loadTexture = async () => {
            try {
                const texture = await viewer.createTexture(textureData.uri);
                if (cancelled) return;

                const materials = viewer.model.materials;

                for (let i = 0; i < materials.length; i ++) {
                    materials[i].pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                }
            } catch (err) {
                console.error("Failed to apply texture", err);
            }
        };

        loadTexture();

        return () => {
            cancelled = true;
        }
    }, [viewerReady, textureData]);

    if (!viewerReady) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-300">
                ...
            </div>
        )
    }

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