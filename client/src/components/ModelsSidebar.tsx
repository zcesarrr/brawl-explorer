import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

type Props = {
    models: string[];
};

export default function ModelsSidebar({ models }: Props) {
    return (
        <Sidebar variant="inset">
            <SidebarContent>
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
            </SidebarContent>
        </Sidebar>
    );
}