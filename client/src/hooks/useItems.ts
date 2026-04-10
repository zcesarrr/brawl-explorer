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
                console.log(json.data[itemsName]);
            } catch (err) {
                console.error(err);
                if (onFetchError) onFetchError();
            } finally {
                setLoadingItems(false);
            }
        }

        getItems();
    }, [endpoint, itemsName, onFetchError]);

    return { items, loadingItems, selectedItem, setSelectedItem, loadingSelectedItem, setLoadingSelectedItem, itemSearch, setItemSearch };
}
