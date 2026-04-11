import type { FileOutput } from "@/types/models.types";
import { useEffect, useState } from "react";

type Props = {
    endpoint: string;
    itemsName: string;
    onFetchError?: () => void;
};

export function useItems({ endpoint, itemsName, onFetchError }: Props) {
    const [items, setItems] = useState<string[]>([]);
    const [loadingItems, setLoadingItems] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<FileOutput | null>(null);
    const [loadingSelectedItem, setLoadingSelectedItem] = useState<boolean>(false);
    const [itemSearch, setItemSearch] = useState<string>("");

    useEffect(() => {
        const getItems = async () => {
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
        }

        getItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, itemsName]);

    const selectItem = async (
        endpoint: string, 
        itemName: string, 
        options?: { 
            booleanCondition?: boolean, 
            disableLoadingOnFinally?: boolean,
            preFetch?: () => void, 
            onFetchError?: () => void 
        }
    ) => {
        if (options?.booleanCondition) {
            if (!options.booleanCondition) return;
        }

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
                if (options?.onFetchError) options?.onFetchError();
                return;
            }

            setSelectedItem({
                uri: json.data.uri,
                filename: json.data.originalName,
                size: json.data.size,
            });
        } catch (err) {
            console.error(err);
            if (options?.onFetchError) options?.onFetchError();
        } finally {
            if (options?.disableLoadingOnFinally) {
                if (options.disableLoadingOnFinally) setLoadingSelectedItem(false);
            }
        }
    }

    return { items, loadingItems, selectedItem, setSelectedItem, loadingSelectedItem, setLoadingSelectedItem, selectItem, itemSearch, setItemSearch };
}
