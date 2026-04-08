import ModelsSidebar from "./components/ModelsSidebar";
import { Button } from "./components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider>
      <ModelsSidebar />
      <SidebarInset>
        <div className="p-2">
          <SidebarTrigger size={"icon-lg"}/>
          <h1>App</h1>
          <Button>Press me!</Button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
