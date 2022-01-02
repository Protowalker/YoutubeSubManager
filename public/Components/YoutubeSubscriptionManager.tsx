import { VStack } from "@chakra-ui/react";
import { useSubscriptions } from "../Hooks/useSubscriptions";
import YoutubeChannelListing from "./YoutubeChannelListing";

export default function YoutubeSubscriptionManager() {

    if(typeof window === 'undefined')
        return null;

  const { subscriptions, isLoading, isError } = useSubscriptions();

  if (isLoading) {
    return <></>;
  }
  if (isError) {
    return <>Error</>;
  }

  return (
    <VStack>
      {subscriptions.map((sub) => (
        <YoutubeChannelListing subscription={sub} key={sub.snippet.resourceId.channelId} />
      ))}
    </VStack>
  );
}