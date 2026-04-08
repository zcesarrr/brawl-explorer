import { ScrollArea } from "./ui/scroll-area";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

type Props = {
    models: string[];
};

export default function ModelsSidebar({ models }: Props) {
    return (
        <Sidebar variant="inset">
            <SidebarContent>
                <ScrollArea className="h-full">
                    <SidebarGroup>
                        <SidebarGroupLabel>Models</SidebarGroupLabel>
                        <SidebarMenu>
                            {models.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton>{item}</SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </ScrollArea>
            </SidebarContent>
        </Sidebar>
    );
}