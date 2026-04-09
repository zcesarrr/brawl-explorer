import { useEffect, useState } from "react";
import ModelsSidebar from "./components/ModelsSidebar";
import ModelViewer from "./components/ModelViewer";
import { Separator } from "./components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Info, LoaderCircle, Moon, Sun } from "lucide-react";
import type { ModelParsed } from "./types/models.types";
import { getAutoSizeString } from "./libs/models.utils";
import { Button } from "./components/ui/button";
import Presentation from "./components/Presentation";
import { useTheme } from "./components/theme-provider";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/`;

export default function App() {
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<ModelParsed | null>(null);
  const [loadingModelViewer, setLoadingModelViewer] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>("");

  const theme = useTheme();

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
          {selectedModel && 
            <>
              <header className="flex gap-2 p-2 items-center overflow-x-auto overflow-y-hidden">
                  <span>{selectedModel.filename}</span>
                  <p className="text-neutral-500">{getAutoSizeString(selectedModel.size)}</p>
              </header>
              <Separator />
            </>
          }
          <div className="relative w-full h-full">
            {selectedModel ? 
              <ModelViewer 
                src={selectedModel.uri}
                loaded={() => setLoadingModelViewer(false)}
              />
              :
              !loadingModelViewer && 
              <Presentation />
            }
            {loadingModelViewer && 
              <div className="absolute w-full h-full left-0 top-0 bg-black/90 flex justify-center items-center">
                <LoaderCircle className="animate-spin text-white" size={48} />
              </div>
            }
          </div>
          <Separator />
          <footer className="flex items-center p-2">
            <div className="flex flex-1 items-center">
              <SidebarTrigger size={"icon-lg"}/>
              <Button 
                variant="ghost" 
                size="icon-lg"
                onClick={() => {
                  if (theme.theme === "light") theme.setTheme("dark");
                  else theme.setTheme("light");
                }}
              >
                {theme.theme === "dark" ? <Moon /> : <Sun />}
              </Button>
              {selectedModel && 
                <>
                  <Separator orientation="vertical" className="mx-1"/>
                  <Button 
                    className="ml-0.5"
                    variant="secondary" 
                    size="lg"
                    disabled={loadingModelViewer}
                    onClick={() => {
                      const link = document.createElement("a");

                      link.href = selectedModel.uri;
                      link.download = selectedModel.filename;

                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Export Model
                  </Button>
                </>
              }
            </div>
            {selectedModel && 
              <Button 
                variant="ghost" 
                size="icon-lg"
                onClick={() => setSelectedModel(null)}
              >
                <Info />
              </Button>
            }
          </footer>
      </SidebarInset>
      {loadingModels && 
        <div className="absolute left-0 top-0 w-full h-full bg-black/80 z-100 flex justify-center items-center">
          <span className="text-4xl">Loading...</span>
        </div>
      }
    </SidebarProvider>
  );
}
