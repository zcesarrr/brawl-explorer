import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Input } from "./ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "./ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";

const modelsPerPage = 100;

type Props = {
    models: string[];
    disabled?: boolean;
    selectedModel?: string | null;
    onModelClick?: (modelName: string) => void;
    onModelSearchChange?: (text: string) => void;
};

export default function ModelsSidebar({ models, onModelClick, disabled = false, selectedModel, onModelSearchChange }: Props) {
    const [offset, setOffset] = useState<number>(0);
    const modelsFiltered = models.slice(offset, modelsPerPage + offset);

    const totalPages = Math.max(1, Math.ceil(models.length / modelsPerPage));
    const currentPage = Math.min(totalPages, Math.floor(offset / modelsPerPage) + 1);

    const getPaginationWindow = (): number[] => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        let start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + 4);

        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }

        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }

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
                        {modelsFiltered.map(item => (
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
                        {getPaginationWindow().map(item => (
                            <PaginationItem key={item}>
                                <PaginationLink 
                                    size="default" 
                                    isActive={item === currentPage}
                                    onClick={() => setOffset((item - 1) * modelsPerPage)}
                                >
                                    {item}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <Popover>
                            <PopoverTrigger asChild>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            </PopoverTrigger>
                            <PopoverContent className="w-24">
                                <Input 
                                    type="number" 
                                    min={1} 
                                    max={totalPages}
                                    defaultValue={currentPage}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
                                        let target = Number(e.currentTarget.value) - 1;
                                        
                                        if (target > totalPages - 1) { 
                                            target = totalPages;
                                            e.currentTarget.value = target.toString();
                                        }

                                        if (target + 1 > 0) {
                                            setOffset(target * modelsPerPage)
                                        }
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </PaginationContent>
                </Pagination>
            </SidebarFooter>
        </Sidebar>
    );
}