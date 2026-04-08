import { useLayoutEffect, useRef, useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

const ROW_HEIGHT = 32;
const OVERSCAN_ROWS = 8;

type Props = {
    models: string[];
    disabled?: boolean;
    selectedModel?: string | null;
    onModelClick?: (modelName: string) => void;
};

export default function ModelsSidebar({ models, onModelClick, disabled = false, selectedModel }: Props) {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useLayoutEffect(() => {
        const element = scrollContainerRef.current;

        if (!element) {
            return;
        }

        const updateMeasurements = () => {
            setContainerHeight(element.clientHeight);
            setScrollTop(element.scrollTop);
        };

        updateMeasurements();

        const resizeObserver = new ResizeObserver(() => {
            updateMeasurements();
        });

        resizeObserver.observe(element);
        element.addEventListener("scroll", updateMeasurements, { passive: true });

        return () => {
            resizeObserver.disconnect();
            element.removeEventListener("scroll", updateMeasurements);
        };
    }, []);

    const visibleStart = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS);
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2;
    const visibleEnd = Math.min(models.length, visibleStart + visibleCount);
    const topSpacerHeight = visibleStart * ROW_HEIGHT;
    const bottomSpacerHeight = Math.max(0, (models.length - visibleEnd) * ROW_HEIGHT);
    const visibleModels = models.slice(visibleStart, visibleEnd);

    return (
        <Sidebar variant="inset">
            <SidebarContent className="overflow-hidden">
                <div ref={scrollContainerRef} className="flex h-full min-h-0 flex-col overflow-auto">
                    <SidebarGroup className="min-h-full">
                        <SidebarGroupLabel>Models</SidebarGroupLabel>
                        <SidebarMenu className="gap-0">
                            {topSpacerHeight > 0 && (
                                <li aria-hidden="true" className="pointer-events-none list-none" style={{ height: topSpacerHeight }} />
                            )}
                            {visibleModels.map((item) => (
                                <SidebarMenuItem key={item}>
                                    <SidebarMenuButton
                                        disabled={disabled || selectedModel === item}
                                        isActive={selectedModel === item}
                                        onClick={() => {
                                            if (onModelClick) onModelClick(item);
                                        }}
                                    >
                                        <p className="truncate">{item}</p>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            {bottomSpacerHeight > 0 && (
                                <li aria-hidden="true" className="pointer-events-none list-none" style={{ height: bottomSpacerHeight }} />
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}