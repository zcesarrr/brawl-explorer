import ModelsSidebar from "./components/ModelsSidebar";
import ModelViewer from "./components/ModelViewer";
import { Separator } from "./components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider>
      <ModelsSidebar />
      <SidebarInset>
          <header className="p-2">
            <SidebarTrigger size={"icon-lg"}/>
          </header>
          <Separator />
          <ModelViewer />
      </SidebarInset>
    </SidebarProvider>
  );
}
