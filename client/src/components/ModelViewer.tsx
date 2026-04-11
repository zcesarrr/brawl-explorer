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
    selectedTextures: { materialName: string; textureUri: string }[];
};

export default function ModelViewer({ src, loaded, selectedTextures }: ModelViewerProps) {
    const modelViewerRef = useRef<any>(null);
    const [viewerReady, setViewerReady] = useState<boolean>(false);
    const [modelLoadVersion, setModelLoadVersion] = useState<number>(0);

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
        if (!viewerReady) return;

        const viewer = modelViewerRef.current;
        if (!viewer) return;

        const handleLoad = () => {
            loaded(viewer.model.materials.map((item: any) => item.name));
            setModelLoadVersion((prev) => prev + 1);
        };

        viewer.addEventListener("load", handleLoad);
        return () => viewer.removeEventListener("load", handleLoad);
    }, [viewerReady, loaded]);

    useEffect(() => {
        if (!viewerReady || selectedTextures.length === 0) return;

        const viewer = modelViewerRef.current;
        if (!viewer?.model?.materials) return;

        let cancelled = false;

        const loadTexture = async () => {
            try {
                const materials = viewer.model.materials;
                const texturesByUri = new Map<string, any>();

                for (const assignment of selectedTextures) {
                    if (!texturesByUri.has(assignment.textureUri)) {
                        const texture = await viewer.createTexture(assignment.textureUri);

                        if (cancelled) return;
                        texturesByUri.set(assignment.textureUri, texture);
                    }

                    const texture = texturesByUri.get(assignment.textureUri);

                    for (let i = 0; i < materials.length; i++) {
                        if (materials[i].name !== assignment.materialName) continue;

                        const baseColorTexture = materials[i]?.pbrMetallicRoughness?.baseColorTexture;
                        if (!baseColorTexture) continue;

                        baseColorTexture.setTexture(texture);
                    }
                }
            } catch (err) {
                console.error("Failed to apply texture", err);
            }
        };

        loadTexture();

        return () => {
            cancelled = true;
        }
    }, [viewerReady, selectedTextures, modelLoadVersion, src]);

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