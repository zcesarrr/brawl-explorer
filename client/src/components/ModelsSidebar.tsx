import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Input } from "./ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "./ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type Props = {
    models: string[];
    disabled?: boolean;
    selectedModel?: string | null;
    onModelClick?: (modelName: string) => void;
    onModelSearchChange?: (text: string) => void;
};

export default function ModelsSidebar({ models, onModelClick, disabled = false, selectedModel, onModelSearchChange }: Props) {
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <Input 
                    type="search" 
                    placeholder="Search a model" 
                    onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
                        if (onModelSearchChange) onModelSearchChange(e.currentTarget.value);
                    }}
                />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="overflow-y-auto">
                    <SidebarGroupLabel>Models</SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5">
                        {models.map(item => (
                            <SidebarMenuItem key={item}>
                                <SidebarMenuButton
                                    disabled={disabled || selectedModel === item}
                                    isActive={selectedModel === item}
                                    onClick={() => {
                                        if (onModelClick) onModelClick(item);
                                    }}
                                >
                                    <p className="truncate">{item.split("_geo.glb")[0]}</p>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationLink size="default" isActive>
                                1
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink size="default">
                                2
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink size="default">
                                3
                            </PaginationLink>
                        </PaginationItem>
                        <Popover>
                            <PopoverTrigger asChild>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            </PopoverTrigger>
                            <PopoverContent className="w-24">
                                <Input type="number" max={10}/>
                            </PopoverContent>
                        </Popover>
                    </PaginationContent>
                </Pagination>
            </SidebarFooter>
        </Sidebar>
    );
}