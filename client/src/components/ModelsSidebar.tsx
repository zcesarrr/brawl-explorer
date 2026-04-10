import SearchablePaginatedList from "./SearchablePaginatedList";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

type Props = {
    models: string[];
    disabled?: boolean;
    selectedModel?: string | null;
    loading?: boolean;
    onModelClick?: (modelName: string) => void;
    onModelSearchChange?: (text: string) => void;
};

export default function ModelsSidebar({ models, onModelClick, disabled = false, selectedModel, onModelSearchChange, loading = true }: Props) {
    return (
        <SearchablePaginatedList
            items={models}
            disabled={disabled}
            selectedItem={selectedModel}
            loading={loading}
            title="Models"
            searchPlaceholder="Search a model"
            onItemClick={onModelClick}
            onSearchChange={onModelSearchChange}
            loadingOverlayClassName="absolute left-0 top-0 z-100 flex h-full w-full items-center justify-center rounded-br-2xl rounded-tr-2xl bg-black/50"
            renderList={({ items, offset, selectedItem, disabled, onItemClick }) => (
                <SidebarGroup className="overflow-y-auto">
                    <SidebarGroupLabel className="flex items-center justify-between gap-1">
                        Models
                        <span className="text-[10px] text-neutral-500">{models.length} results</span>
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {items.map((item, index) => (
                            <SidebarMenuItem key={item}>
                                <SidebarMenuButton
                                    disabled={disabled || selectedItem === item}
                                    isActive={selectedItem === item}
                                    onClick={() => onItemClick?.(item)}
                                >
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="text-[8px] text-neutral-500">{index + 1 + offset}</span>
                                        <p className="truncate">{item.split("_geo.glb")[0]}</p>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
            renderLayout={({ search, list, pagination, loadingOverlay }) => (
                <Sidebar variant="inset">
                    <SidebarHeader>{search}</SidebarHeader>
                    <SidebarContent>{list}</SidebarContent>
                    <SidebarFooter>{pagination}</SidebarFooter>
                    {loadingOverlay}
                </Sidebar>
            )}
        />
    );
}