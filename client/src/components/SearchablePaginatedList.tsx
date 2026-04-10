import { LoaderCircle, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "./ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type LayoutSections = {
    search: ReactNode;
    list: ReactNode;
    pagination: ReactNode;
    loadingOverlay: ReactNode;
};

type ListRendererArgs = {
    items: string[];
    offset: number;
    selectedItem?: string | null;
    disabled: boolean;
    splitLabel?: string;
    onItemClick?: (item: string) => void;
};

type Props = {
    items: string[];
    disabled?: boolean;
    selectedItem?: string | null;
    loading?: boolean;
    itemsPerPage?: number;
    title?: string;
    searchPlaceholder?: string;
    splitLabel?: string;
    inputSearchDefault?: string;
    onItemClick?: (item: string) => void;
    onSearchChange?: (text: string) => void;
    renderLayout?: (sections: LayoutSections) => ReactNode;
    renderList?: (args: ListRendererArgs) => ReactNode;
    loadingOverlayClassName?: string;
};

export default function SearchablePaginatedList({
    items,
    disabled = false,
    selectedItem,
    loading = false,
    itemsPerPage = 75,
    title = "List",
    searchPlaceholder = "Search a list",
    splitLabel,
    inputSearchDefault,
    onItemClick,
    onSearchChange,
    renderLayout,
    renderList,
    loadingOverlayClassName,
}: Props) {
    const [searchInputText, setSearchInputText] = useState<string>(inputSearchDefault || "");
    const [offset, setOffset] = useState<number>(0);

    const itemsFiltered = useMemo(() => {
        return items.slice(offset, itemsPerPage + offset);
    }, [items, itemsPerPage, offset]);

    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const currentPage = Math.min(totalPages, Math.floor(offset / itemsPerPage) + 1);

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
    };

    const searchSection = (
        <InputGroup>
            <InputGroupInput
                className="[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                type="search"
                placeholder={searchPlaceholder}
                value={searchInputText}
                onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
                    const value = e.currentTarget.value;
                    onSearchChange?.(value);
                    setSearchInputText(value);
                    setOffset(0);
                }}
            />
            {searchInputText !== "" && (
                <InputGroupAddon
                    align="inline-end"
                    onClick={() => {
                        setSearchInputText("");
                        onSearchChange?.("");
                        setOffset(0);
                    }}
                >
                    <InputGroupButton>
                        <X />
                    </InputGroupButton>
                </InputGroupAddon>
            )}
        </InputGroup>
    );

    const defaultList = (
        <div className="space-y-1 overflow-y-auto">
            <div className="flex items-center justify-between gap-1 px-2">
                <span>{title}</span>
                <span className="text-[10px] text-neutral-500">{items.length} results</span>
            </div>
            <ul className="space-y-1">
                {itemsFiltered.map((item, index) => (
                    <li key={item}>
                        <button
                            type="button"
                            disabled={disabled || selectedItem === item}
                            onClick={() => onItemClick?.(item)}
                            className="hover:bg-accent/70 data-[active=true]:bg-accent flex w-full items-center rounded-md px-2 py-1 text-left disabled:cursor-not-allowed disabled:opacity-50"
                            data-active={selectedItem === item}
                        >
                            <div className="flex items-center gap-1.5 truncate">
                                <span className="text-[8px] text-neutral-500">{index + 1 + offset}</span>
                                <p className="truncate">{splitLabel ? item.split(splitLabel)[0] : item}</p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

    const listSection = renderList
        ? renderList({
            items: itemsFiltered,
            offset,
            disabled,
            selectedItem,
            onItemClick,
            splitLabel,
        })
        : defaultList;

    const paginationSection = (
        <Pagination>
            <PaginationContent>
                {getPaginationWindow().length > 1 &&
                    getPaginationWindow().map((item) => (
                        <PaginationItem key={item}>
                            <PaginationLink
                                size="default"
                                isActive={item === currentPage}
                                onClick={() => setOffset((item - 1) * itemsPerPage)}
                            >
                                {item}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                {totalPages > 5 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        </PopoverTrigger>
                        <PopoverContent className="w-20">
                            <Input
                                type="number"
                                min={1}
                                max={totalPages}
                                defaultValue={currentPage}
                                enterKeyHint="done"
                                onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
                                    let target = Number(e.currentTarget.value) - 1;

                                    if (target > totalPages - 1) {
                                        target = totalPages - 1;
                                        e.currentTarget.value = (target + 1).toString();
                                    }

                                    if (target >= 0) {
                                        setOffset(target * itemsPerPage);
                                    }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                )}
            </PaginationContent>
        </Pagination>
    );

    const loadingOverlay = loading ? (
        <div
            className={
                loadingOverlayClassName ??
                "absolute left-0 top-0 z-100 flex h-full w-full items-center justify-center bg-black/50"
            }
        >
            <LoaderCircle className="animate-spin" size={32} />
        </div>
    ) : null;

    if (renderLayout) {
        return renderLayout({
            search: searchSection,
            list: listSection,
            pagination: paginationSection,
            loadingOverlay,
        });
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-background">
            <div className="border-b p-2">{searchSection}</div>
            <div className="min-h-0 flex-1 p-2 overflow-y-auto">{listSection}</div>
            <div className="border-t p-2">{paginationSection}</div>
            {loadingOverlay}
        </div>
    );
}
