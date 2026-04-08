import { useEffect, useState } from "react";
import ModelsSidebar from "./components/ModelsSidebar";
import ModelViewer from "./components/ModelViewer";
import { Separator } from "./components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

const API_URL = "http://localhost:3000/";

export default function App() {
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loadingModelViewer, setLoadingModelViewer] = useState<boolean>(false);

  useEffect(() => {
    const getModels = async () => {
      setLoadingModels(true);

      try {
        const res = await fetch(API_URL);

        const json = await res.json();

        if (!res.ok || !json.success) {
          console.error(json.error || "Request failed");
        }

        setModels(json.data.models);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingModels(false);
      }
    };

    getModels();
  }, []);

  const handleModelClick = async (modelName: string) => {
    setLoadingModelViewer(true);

    try {
      const res = await fetch(`${API_URL}parse-model`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: modelName,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        console.error(json.error || "Request failed");
      }

      setSelectedModel(json.data.uri);

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <SidebarProvider className="relative">
      <ModelsSidebar 
        models={models} 
        onModelClick={(modelName) => handleModelClick(modelName)}
      />
      <SidebarInset>
          <header className="p-2">
            <SidebarTrigger size={"icon-lg"}/>
          </header>
          <Separator />
          <div className="relative w-full h-full">
            {selectedModel && 
              <ModelViewer 
                src={selectedModel}
                loaded={() => setLoadingModelViewer(false)}
              />
            }
            {loadingModelViewer && 
              <div className="absolute w-full h-full left-0 top-0 bg-black/90 flex justify-center items-center">
                <span className="text-3xl">Loading...</span>
              </div>
            }
          </div>
      </SidebarInset>
      {loadingModels && 
        <div className="absolute left-0 top-0 w-full h-full bg-black/80 z-100 flex justify-center items-center">
          <span className="text-4xl">Loading...</span>
        </div>
      }
    </SidebarProvider>
  );
}
