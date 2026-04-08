import "@google/model-viewer";

export default function ModelViewer() {
    return (
        <model-viewer 
            className="w-full h-full"
            src="sirius_geo.glb" 
            camera-controls 
            touch-action
        />
    );
}
