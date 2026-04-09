import { useEffect, useRef } from "react";

type Props = {
    src: string;
    loaded: () => void;
};

export default function ModelViewer({ src, loaded }: Props) {
    const modelViewerRef = useRef<any>(null);

    useEffect(() => {
        const viewer = modelViewerRef.current;

        if (!viewer) return;

        const handleLoad = async () => {
            loaded();

            const materials = viewer.model.materials;
            const texture = await viewer.createTexture("alli_valentine_tex.png");

            for (let i = 0; i < materials.length; i ++) {
                materials[i].pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
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
