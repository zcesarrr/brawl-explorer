import SearchablePaginatedList from "./SearchablePaginatedList";

type Props = {
    files: string[];
    disabled?: boolean;
    selectedModel?: string | null;
    loading?: boolean;
    onModelClick?: (modelName: string) => void;
    onModelSearchChange?: (text: string) => void;
};

export default function FilesList({ files, onModelClick, disabled = false, selectedModel, onModelSearchChange, loading = true }: Props) {
    return (
        <SearchablePaginatedList
            items={files}
            disabled={disabled}
            selectedItem={selectedModel}
            loading={loading}
            title="Files"
            searchPlaceholder="Search a file"
            onItemClick={onModelClick}
            onSearchChange={onModelSearchChange}
        />
    );
}
