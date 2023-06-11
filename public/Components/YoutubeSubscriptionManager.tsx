/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Textarea, VStack } from "@chakra-ui/react";
import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useSubscriptions } from "../Hooks/useSubscriptions";
import YoutubeChannelListing from "./YoutubeChannelListing";

export const SelectedSubscriptionContext =
    createContext<[string[], (subs: string[]) => void]>(undefined);

export default function YoutubeSubscriptionManager() {
    if (typeof window === "undefined") return null;

    const { subscriptions, isLoading, isError } = useSubscriptions();

    const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

    const [fetchRequest, setFetchRequest] = useState("");

    const newFetchRequest = useMemo(() => {
        const request = parseFetch(fetchRequest);
        request.params = request.params.replace(
            /\\?"channelIds\\?": ?\[.*\]/,
            `\\"channelIds\\": ${JSON.stringify(selectedSubs).replaceAll(
                '"',
                '\\"'
            )}`
        );

        return `fetch("${request.url}", ${request.params});`;
    }, [fetchRequest, selectedSubs]);

    if (isLoading) {
        return <></>;
    }
    if (isError) {
        return <>Error</>;
    }

    return (
        <SelectedSubscriptionContext.Provider
            value={[selectedSubs, setSelectedSubs]}
        >
            <Textarea
                value={fetchRequest}
                onChange={(e) => setFetchRequest(e.target.value)}
            />
            <Textarea value={newFetchRequest} readOnly />
            <VStack>
                {subscriptions.map((sub) => (
                    <YoutubeChannelListing
                        subscription={sub}
                        key={sub.snippet.resourceId.channelId}
                    />
                ))}
            </VStack>
        </SelectedSubscriptionContext.Provider>
    );
}

function parseFetch(fetchRequest: string): {
    url: string;
    params: string;
} {
    const regex = /fetch\("(.*)", ?([\s\S]*)\);/.exec(fetchRequest);
    if (!regex) {
        return { url: "", params: "" };
    }
    const url = regex[1];
    const params = regex[2];
    return { url, params };
}
