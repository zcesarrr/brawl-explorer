import SearchablePaginatedList from "./SearchablePaginatedList";

type Props = {
    files: string[];
    disabled?: boolean;
    selectedFile?: string | null;
    loading?: boolean;
    splitLabel?: string;
    filesPerPage?: number;
    inputDefault?: string;
    searchPlaceholder?: string;
    title?: string;
    onFileClick?: (filename: string) => void;
    onFileSearchChange?: (text: string) => void;
};

export default function FilesList({ files, onFileClick, disabled = false, selectedFile, onFileSearchChange, loading = true, splitLabel, filesPerPage, inputDefault, searchPlaceholder, title }: Props) {
    return (
        <SearchablePaginatedList
            items={files}
            disabled={disabled}
            selectedItem={selectedFile}
            loading={loading}
            title={title || "Files"}
            searchPlaceholder={searchPlaceholder || "Search a file"}
            onItemClick={onFileClick}
            onSearchChange={onFileSearchChange}
            splitLabel={splitLabel}
            itemsPerPage={filesPerPage}
            inputSearchDefault={inputDefault}
        />
    );
}
