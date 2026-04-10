import { useEffect, useState } from "react";
import ModelsSidebar from "./components/ModelsSidebar";
import ModelViewer from "./components/ModelViewer";
import { Separator } from "./components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { House, Info, LoaderCircle, Moon, Sun } from "lucide-react";
import type { FileOutput } from "./types/models.types";
import { getAutoSizeString } from "./libs/models.utils";
import { Button } from "./components/ui/button";
import Presentation from "./components/Presentation";
import { useTheme } from "./components/theme-provider";
import { toast, Toaster, useSonner } from "sonner";
import { Field, FieldGroup, FieldLabel } from "./components/ui/field";
import { Checkbox } from "./components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import FilesList from "./components/FilesList";
import { ButtonGroup } from "./components/ui/button-group";
import Information from "./components/Information";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
const AUTO_LOAD_TEXTURE_STORAGE = "auto_load_texture";

function getSearchResults(search: string, items: string[], exclude?: string[]): string[] {
  return items.filter(item => {
    if (exclude?.includes(item)) return false;
    if (!item) return true;

    const searchWords = search.toLowerCase().trim().split(/\s+/);

    const itemLower = item.toLowerCase();

    return searchWords.every(word => itemLower.includes(word));
  });
}

export default function App() {
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<FileOutput | null>(null);
  const [loadingModelViewer, setLoadingModelViewer] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>("");

  const [textures, setTextures] = useState<string[]>([]);
  const [loadingTextures, setLoadingTextures] = useState<boolean>(false);
  const [textureSearch, setTextureSearch] = useState<string>("");
  const [textureLoaded, setTextureLoaded] = useState<FileOutput | null>(null);
  const [loadingSelectedTexture, setLoadingSelectedTexture] = useState<boolean>(false);
  const [autoLoadTexture, setAutoLoadTexture] = useState<boolean>(false);

  const theme = useTheme();

  const filteredModels = getSearchResults(modelSearch, models, ["allie_geo.glb"]);
  const filteredTextures = getSearchResults(textureSearch, textures);

  const { toasts } = useSonner();

  useEffect(() => {
    const getModels = async () => {
      setLoadingModels(true);

      try {
        const res = await fetch(`${API_URL}/models`);

        const json = await res.json();

        if (!res.ok || !json.success) {
          console.error(json.error || "Request failed");
        }

        setModels(json.data.models);
      } catch (err) {
        console.error(err);
        toast.error("Connection failed", { id: "connection_error", description: "Something went wrong. Try again later!", duration: 99999 });
      } finally {
        setLoadingModels(false);
      }
    };

    getModels();
    setAutoLoadTexture(localStorage.getItem(AUTO_LOAD_TEXTURE_STORAGE) === "true");
  }, []);

  const removeAllToasts = () => {
    toasts.forEach(t => toast.dismiss(t.id));
  }

  const handleModelClick = async (modelName: string) => {
    setLoadingModelViewer(true);

    removeAllToasts();
    setTextureLoaded(null);

    try {
      const res = await fetch(`${API_URL}/parse-model`, {
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

  const loadTextures = async () => {
    setLoadingTextures(true);

    try {
      const res = await fetch(`${API_URL}/textures`);

      const json = await res.json();

      if (!res.ok || !json.success) {
        console.error(json.error || "Request failed");
      }

      setTextures(json.data.textures);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTextures(false);
    }
  };

  const handleLoadTexture = async (filename?: string) => {
    if (!selectedModel) return;

    const modelNameSplit = selectedModel.filename.split("_geo.glb");
    const textureName = filename ?? `${modelNameSplit[0]}_tex.sctx`;

    setLoadingSelectedTexture(true);

    try {
      const res = await fetch(`${API_URL}/parse-texture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: textureName,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        console.error(json.error || "Request failed");
      }

      const textureData = {
        uri: json.data.uri,
        filename: json.data.originalName,
        size: json.data.size,
      }

      setTextureLoaded(textureData);
    } catch (err) {
      console.error(err);
      toast.error("The texture was not found", { id: "texture_not_found" });
    } finally {
      setLoadingSelectedTexture(false);
    }
  };

  return (
    <SidebarProvider className="relative">
      <ModelsSidebar 
        models={filteredModels} 
        disabled={loadingModelViewer || loadingSelectedTexture}
        onModelClick={(modelName) => handleModelClick(modelName)}
        selectedModel={selectedModel ? selectedModel.filename : null}
        onModelSearchChange={(text) => setModelSearch(text)}
        loading={loadingModels}
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
              <div className="relative w-full h-full">
                <ModelViewer 
                  src={selectedModel.uri}
                  loaded={() => { 
                    setLoadingModelViewer(false)
                    if (autoLoadTexture) handleLoadTexture();
                  }}
                  textureData={textureLoaded}
                />
                <div className="absolute left-2 bottom-2">
                  <p className="text-sm text-neutral-300 mb-1">Export</p>
                  <div className="flex gap-1">
                    <ButtonGroup>
                      <ExportButton 
                        disabled={loadingModelViewer} 
                        fileMetadata={selectedModel} 
                        label="Model (.glb)"
                      />
                      
                      <ExportButton 
                        disabled={loadingSelectedTexture || !textureLoaded} 
                        fileMetadata={textureLoaded ? {
                          filename: `${textureLoaded.filename.split(".sctx")[0]}.png`,
                          uri: textureLoaded.uri,
                        } : null} 
                        label="Texture (.png)"
                      />
                    </ButtonGroup>
                  </div>
                </div>
              </div>
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
          <footer className="flex items-center p-2 overflow-x-auto overflow-y-hidden">
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
                  <Separator orientation="vertical" className="ml-1 mr-1.5"/>
                  {loadingSelectedTexture && <LoaderCircle className="animate-spin mr-1" size={16}/>}
                  <div className="flex gap-1 items-center">
                    <ButtonGroup>
                      <Dialog 
                        onOpenChange={open => {
                          if (open) {
                            if (textures.length === 0) {
                              loadTextures();
                            }
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="lg"
                            disabled={loadingModelViewer || loadingSelectedTexture}
                          >
                            Texture Search
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Texture Search</DialogTitle>
                            <DialogDescription>Choose a texture from this list to apply</DialogDescription>
                          </DialogHeader>
                          <div className="max-h-90 overflow-hidden">
                            <FilesList
                              files={filteredTextures}
                              loading={loadingTextures || loadingSelectedTexture}
                              splitLabel="_tex.sctx"
                              onFileSearchChange={(text: string) => setTextureSearch(text)}
                              selectedFile={textureLoaded?.filename}
                              onFileClick={(textureName) => handleLoadTexture(textureName)}
                              filesPerPage={50}
                              inputDefault={textureSearch}
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="secondary" 
                        size="lg"
                        disabled={loadingModelViewer || loadingSelectedTexture}
                        onClick={() => {
                          handleLoadTexture();
                        }}
                      >
                        Auto Texture
                      </Button>
                    </ButtonGroup>
                    <FieldGroup className="w-32 ml-1">
                      <Field orientation="horizontal">
                        <Checkbox 
                          id="auto-load-texture" 
                          checked={autoLoadTexture} 
                          onCheckedChange={(checked) => {
                            const check = checked === true;

                            setAutoLoadTexture(check);
                            if (check) handleLoadTexture();

                            localStorage.setItem(AUTO_LOAD_TEXTURE_STORAGE, check ? "true" : "false");
                          }} 
                        />
                        <FieldLabel htmlFor="auto-load-texture">Auto load texture</FieldLabel>
                      </Field>
                    </FieldGroup>
                  </div>
                </>
              }
            </div>
            {selectedModel ? 
              <>
                <Separator orientation="vertical" className="mx-1"/>
                <Button 
                  variant="ghost" 
                  size="icon-lg"
                  onClick={() => setSelectedModel(null)}
                >
                  <House />
                </Button>
              </>
              :
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon-lg"
                  >
                    <Info />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Information</DialogTitle>
                    <DialogDescription>About the project, tools and notes</DialogDescription>
                  </DialogHeader>
                  <div>
                    <Information />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          </footer>
      </SidebarInset>
      <Toaster 
        theme={theme.theme} 
        visibleToasts={1} 
        position="bottom-center" 
        mobileOffset={{ bottom: "52px" }}
      />
    </SidebarProvider>
  );
}

type ExportButtonProps = {
  disabled: boolean;
  fileMetadata?: { uri: string, filename: string } | null;
  label: string;
};

function ExportButton({ disabled, fileMetadata, label }: ExportButtonProps) {
  return (
    <Button 
      variant="default" 
      size="lg"
      disabled={disabled}
      onClick={() => {
        if (!fileMetadata) return;

        const link = document.createElement("a");

        link.href = fileMetadata.uri;
        link.download = fileMetadata.filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
    >
      {label}
    </Button>
  );
}
