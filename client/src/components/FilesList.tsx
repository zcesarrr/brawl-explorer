import SearchablePaginatedList from "./SearchablePaginatedList";

type Props = {
    files: string[];
    disabled?: boolean;
    selectedFile?: string | null;
    loading?: boolean;
    splitLabel?: string;
    filesPerPage?: number;
    onFileClick?: (filename: string) => void;
    onFileSearchChange?: (text: string) => void;
};

export default function FilesList({ files, onFileClick, disabled = false, selectedFile, onFileSearchChange, loading = true, splitLabel, filesPerPage }: Props) {
    return (
        <SearchablePaginatedList
            items={files}
            disabled={disabled}
            selectedItem={selectedFile}
            loading={loading}
            title="Files"
            searchPlaceholder="Search a file"
            onItemClick={onFileClick}
            onSearchChange={onFileSearchChange}
            splitLabel={splitLabel}
            itemsPerPage={filesPerPage}
        />
    );
}
