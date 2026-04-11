import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "./components/ui/field";
import { toast, Toaster, useSonner } from "sonner";
import { ButtonGroup } from "./components/ui/button-group";
import { Checkbox } from "./components/ui/checkbox";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import ModelsSidebar from "./components/ModelsSidebar";
import Information from "./components/Information";
import { House, Info, LoaderCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "./components/theme-provider";
import { useItems } from "./hooks/useItems";
import { getAutoSizeString } from "./libs/models.utils";
import ModelViewer from "./components/ModelViewer";
import SearchablePaginatedList, { buttonClassName } from "./components/SearchablePaginatedList";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./components/ui/popover";
import type { FileOutput } from "./types/models.types";

type MaterialTextureAssignment = {
  materialName: string;
  textureUri: string;
};

const API_URL = import.meta.env.VITE_API_URL;
const AUTO_LOAD_TEXTURE_STORAGE = "auto_load_texture";

export default function App() {
  const [autoLoadTexture, setAutoLoadTexture] = useState<boolean>(false);
  const [materials, setMaterials] = useState<string[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<MaterialTextureAssignment[]>([]);

  const { 
    filteredItems: filteredModels, 
    loadingItems: loadingModels, 
    getItems: getModels,
    selectedItem: selectedModel, 
    setSelectedItem: setSelectedModel, 
    loadingSelectedItem: loadingModelViewer, 
    setLoadingSelectedItem: setLoadingModelViewer, 
    selectItem: selectModel,
    setItemSearch: setModelSearch 
  } = useItems(["allie_geo.glb"]);

  const { 
    filteredItems: filteredTextures,
    loadingItems: loadingTextures,
    getItems: getTextures,
    selectedItem: textureLoaded,
    setSelectedItem: setTextureLoaded,
    loadingSelectedItem: loadingSelectedTexture,
    selectItem: selectTexture,
    itemSearch: textureSearch,
    setItemSearch: setTextureSearch,
  } = useItems();

  const theme = useTheme();

  const { toasts } = useSonner();

  useEffect(() => {
    const start = () => {
      getModels(`${API_URL}/models`, "models", () => {
        toast.error("Connection failed", { id: "connection_error", description: "Something went wrong. Try again later!", duration: 99999 });
      });

      setAutoLoadTexture(localStorage.getItem(AUTO_LOAD_TEXTURE_STORAGE) === "true");
    }

    start();
  }, [getModels]);

  const removeAllToasts = () => {
    toasts.forEach(t => toast.dismiss(t.id));
  }

  const handleLoadTexture = async (filename?: string, material?: string) => {
    if (!selectedModel) return;

    const modelNameSplit = selectedModel.filename.split("_geo.glb");
    const textureName = filename ?? `${modelNameSplit[0]}_tex.sctx`;

    selectTexture(
      `${API_URL}/parse-texture`,
      textureName,
      {
        onFetchError: () => {
          toast.error("The texture was not found", { id: "texture_not_found" });
        },
        onFinished: (output: FileOutput) => {
          const targetMaterials = material ? [material] : materials;

          if (targetMaterials.length === 0) return;

          setSelectedTextures((prev) => {
            const next = [...prev];

            targetMaterials.forEach((materialName) => {
              const index = next.findIndex((item) => item.materialName === materialName);

              if (index >= 0) {
                next[index] = { materialName, textureUri: output.uri };
                return;
              }

              next.push({ materialName, textureUri: output.uri });
            });

            return next;
          });
        }
      },
    );
  };

  const TextureButtonProps: { variant: "secondary"; size: "lg"; disabled: boolean } = {
    variant: "secondary",
    size: "lg",
    disabled: loadingModelViewer || loadingSelectedTexture,
  };

  return (
    <SidebarProvider className="relative">
      <ModelsSidebar 
        models={filteredModels} 
        disabled={loadingModelViewer || loadingSelectedTexture}
        onModelClick={(modelName) => 
          selectModel(
            `${API_URL}/parse-model`, 
            modelName, 
            {
              preFetch: () => {
                removeAllToasts();
                setTextureLoaded(null);
                setSelectedTextures([]);
              },
              disableQuitLoadingOnFinally: true,
            }
          )
        }
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
                  loaded={(materials) => { 
                    setLoadingModelViewer(false);
                    setMaterials(materials);
                    setSelectedTextures((prev) => prev.filter((item) => materials.includes(item.materialName)));
                    if (autoLoadTexture) handleLoadTexture();
                  }}
                  selectedTextures={selectedTextures}
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
                            if (filteredTextures.length === 0) {
                              getTextures(
                                `${API_URL}/textures`,
                                "textures"
                              );
                            }
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button {...TextureButtonProps}>Texture Search</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Texture Search</DialogTitle>
                            <DialogDescription>Choose a texture from this list to apply</DialogDescription>
                          </DialogHeader>
                          <div className="max-h-90 overflow-hidden">
                            <SearchablePaginatedList
                              items={filteredTextures}
                              searchPlaceholder="Search a texture"
                              title="Textures"
                              loading={loadingTextures || loadingSelectedTexture}
                              onSearchChange={(text: string) => setTextureSearch(text)}
                              itemsPerPage={50}
                              inputSearchDefault={textureSearch}
                              renderList={({ items, disabled }) => (
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <p className="text-neutral-400">Textures</p>
                                    <span className="text-[10px] text-neutral-500">{items.length} results</span>
                                  </div>
                                  <ul className="flex gap-1 flex-col">
                                    {items.map((item, index) => (
                                      <li key={index}>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <button 
                                              disabled={disabled}
                                              className={buttonClassName}
                                            >
                                              {item.split("_tex.sctx")[0]}
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent>
                                            <PopoverHeader>
                                              <PopoverTitle>Materials</PopoverTitle>
                                              <PopoverDescription>Choose a material to apply the selected texture</PopoverDescription>
                                            </PopoverHeader>
                                            <ul className="flex flex-col gap-1.5">
                                              {materials.map(mat => (
                                                <li key={mat}>
                                                  <button 
                                                    className={`${buttonClassName} outline outline-accent truncate`}
                                                    onClick={() => {
                                                      handleLoadTexture(item, mat);
                                                    }}
                                                    disabled={loadingSelectedTexture}
                                                  >
                                                    {mat}
                                                  </button>
                                                </li>
                                              ))}
                                            </ul>
                                          </PopoverContent>
                                        </Popover>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button {...TextureButtonProps} onClick={() =>handleLoadTexture()}>Auto Texture</Button>
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


function Presentation() {
    return (
        <div className="flex flex-col w-full h-full justify-center items-center text-neutral-500 text-center">
            <div className="flex flex-1 flex-col items-center justify-center gap-2 mt-8">
                <div className="flex items-center justify-center gap-2">
                    <h1 className="text-3xl">Brawl Explorer</h1>
                    <Badge className="mt-1 rounded-none" variant="outline">Beta</Badge>
                </div>
                <h2>
                    A web tool to visualize and explore Brawl Stars assets
                </h2>
            </div>
            <p className="px-4 pb-4 text-xs">
                This material is unofficial and is not endorsed by Supercell. For more information see Supercell's Fan Content Policy: {" "}
                <a 
                    href="https://www.supercell.com/fan-content-policy" 
                    target="_blank" 
                    rel="noreferrer noopener"
                    className="text-neutral-400 underline"
                >
                    www.supercell.com/fan-content-policy.
                </a>
            </p>
        </div>
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
