import { ScrollArea } from "./ui/scroll-area";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

type Props = {
    models: string[];
    disabled?: boolean;
    selectedModel?: string | null;
    onModelClick?: (modelName: string) => void;
};

export default function ModelsSidebar({ models, onModelClick, disabled = false, selectedModel }: Props) {
    return (
        <Sidebar variant="inset">
            <SidebarContent>
                <ScrollArea className="h-full">
                    <SidebarGroup>
                        <SidebarGroupLabel>Models</SidebarGroupLabel>
                        <SidebarMenu>
                            {models.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton 
                                        disabled={disabled || selectedModel === item} 
                                        isActive={selectedModel === item}
                                        onClick={() => {
                                            if (onModelClick) onModelClick(item);
                                        }}
                                    >
                                        {item}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </ScrollArea>
            </SidebarContent>
        </Sidebar>
    );
}