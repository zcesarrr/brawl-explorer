import type { FileOutput } from "@/types/models.types";
import { useCallback, useMemo } from "react";
import { useState } from "react";

function getSearchResults(search: string, items: string[], exclude?: string[]): string[] {
  return items.filter(item => {
    if (exclude?.includes(item)) return false;
    if (!item) return true;

    const searchWords = search.toLowerCase().trim().split(/\s+/);

    const itemLower = item.toLowerCase();

    return searchWords.every(word => itemLower.includes(word));
  });
}

export function useItems(excludedItems?: string[]) {
    const [items, setItems] = useState<string[]>([]);
    const [loadingItems, setLoadingItems] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<FileOutput | null>(null);
    const [loadingSelectedItem, setLoadingSelectedItem] = useState<boolean>(false);
    const [itemSearch, setItemSearch] = useState<string>("");

    const getItems = useCallback(async (endpoint: string, itemsName: string, onFetchError?: () => void) => {
        setLoadingItems(true);

        try {
            const res = await fetch(endpoint);

            const json = await res.json();

            if (!res.ok || !json.success) {
                console.error(json.error || "Request failed");
                if (onFetchError) onFetchError();
                return;
            }

            setItems(json.data[itemsName]);
        } catch (err) {
            console.error(err);
            if (onFetchError) onFetchError();
        } finally {
            setLoadingItems(false);
        }
    }, []);

    const selectItem = async (
        endpoint: string, 
        itemName: string, 
        options?: { 
            disableQuitLoadingOnFinally?: boolean,
            preFetch?: () => void, 
            onFetchError?: () => void 
            onFinished?: (output: FileOutput) => void
        }
    ) => {
        setLoadingSelectedItem(true);
        
        if (options?.preFetch) options?.preFetch();
        
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    filename: itemName,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                console.error(json.error || "Request failed");
                setLoadingSelectedItem(false);
                if (options?.onFetchError) options?.onFetchError();
                return;
            }

            const data = {
                uri: json.data.uri,
                filename: json.data.originalName,
                size: json.data.size,
            }

            setSelectedItem(data);

            if (options?.disableQuitLoadingOnFinally) {
                if (!options.disableQuitLoadingOnFinally) {
                    setLoadingSelectedItem(false);
                }
            } else {
                setLoadingSelectedItem(false);
            }

            if (options?.onFinished) options.onFinished(data);
        } catch (err) {
            console.error(err);
            setLoadingSelectedItem(false);
            if (options?.onFetchError) options?.onFetchError();
        }
    }

    const filteredItems = useMemo(
        () => getSearchResults(itemSearch, items, excludedItems), 
        [excludedItems, itemSearch, items]
    );

    return {
        items,
        filteredItems, 
        loadingItems, 
        getItems, 
        selectedItem, 
        setSelectedItem, 
        loadingSelectedItem, 
        setLoadingSelectedItem, 
        selectItem, 
        itemSearch, 
        setItemSearch,
    };
}
