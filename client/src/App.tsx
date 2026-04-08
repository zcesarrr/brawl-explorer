import { useEffect, useState } from "react";
import ModelsSidebar from "./components/ModelsSidebar";
import ModelViewer from "./components/ModelViewer";
import { Separator } from "./components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { LoaderCircle } from "lucide-react";
import type { ModelParsed } from "./types/models.types";
import getKbSize from "./libs/models.utils";

const API_URL = "http://localhost:3000/";

export default function App() {
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<ModelParsed | null>(null);
  const [loadingModelViewer, setLoadingModelViewer] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>("");

  const filteredModels = models.filter(model => model.includes(modelSearch.toLowerCase()));

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

      setSelectedModel({
        uri: json.data.uri,
        filename: json.data.originalName,
        size: json.data.size,
      });

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <SidebarProvider className="relative">
      <ModelsSidebar 
        models={filteredModels} 
        disabled={loadingModelViewer}
        onModelClick={(modelName) => handleModelClick(modelName)}
        selectedModel={selectedModel ? selectedModel.filename : null}
        onModelSearchChange={(text) => setModelSearch(text)}
      />
      <SidebarInset>
          <header className="flex p-2 items-center">
            <SidebarTrigger size={"icon-lg"}/>
            {selectedModel && 
              <>
                <Separator orientation="vertical" className="mx-1" />
                <div className="ml-1 flex gap-2">
                  <span>{selectedModel.filename}</span>
                  ·
                  <p>{getKbSize(selectedModel.size)}kb</p>
                </div>
              </>
            }
          </header>
          <Separator />
          <div className="relative w-full h-full">
            {selectedModel && 
              <ModelViewer 
                src={selectedModel.uri}
                loaded={() => setLoadingModelViewer(false)}
              />
            }
            {loadingModelViewer && 
              <div className="absolute w-full h-full left-0 top-0 bg-black/90 flex justify-center items-center">
                <LoaderCircle className="animate-spin" size={48} />
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
