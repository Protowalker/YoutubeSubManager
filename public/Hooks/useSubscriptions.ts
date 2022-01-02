import { promisify } from "util";
import { YoutubeChannel } from "../Interfaces/YoutubeInterfaces";
import {prop, uniqBy} from "ramda";
import useSWR from "swr";
import { SuspenseProps } from "react";


export type Subscription = gapi.client.youtube.Subscription;

const subscriptionFetcher = async (): Promise<Subscription[]> => {
    if(typeof gapi.client === 'undefined')
        await promisify(gapi.load)("client");
    if(typeof gapi.client.youtube === 'undefined')
        await gapi.client.load('youtube', 'v3');

    let page = await gapi.client['youtube'].subscriptions.list({
        "part": [
            "snippet",
            "contentDetails"
        ],
        maxResults: 50,
        "mine": true,
    }).then(resp => resp.result);
    if (page !== undefined) {
        let subs = page.items;
        while (page.nextPageToken !== undefined) {
            page = await gapi.client.youtube.subscriptions.list({
                "part": [
                    "snippet",
                    "contentDetails"
                ],
                order: "alphabetical",
                maxResults: 50,
                pageToken: page.nextPageToken,
                "mine": true,
            }).then(resp => resp.result);
            subs = subs.concat(page.items);
        }

        subs = uniqBy(prop('id'), subs);
        return subs;
    }

};



export function useSubscriptions(): {subscriptions: Array<Subscription>, isLoading: boolean, isError: Error} {
    const { data, error, mutate} = useSWR("/", subscriptionFetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        refreshWhenHidden: false,
        refreshWhenOffline: false
    });


    return {
      subscriptions: data,
      isLoading: !error && !data,
      isError: error
    };
}