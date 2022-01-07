import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  LinkOverlay,
  Text,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { Subscription } from "../Hooks/useSubscriptions";
import { YoutubeChannel } from "../Interfaces/YoutubeInterfaces";
import Video from "./YoutubeVideo";

export default function YoutubeChannelListing(props: {
  subscription: Subscription;
}) {
  const {
    channel: channelFeed,
    isLoading,
    error,
  } = useChannel(props.subscription.snippet.resourceId.channelId);

  const [subscribed, setSubscribed] = useState(true);
  const [processingOperation, setProcessingOperation] = useState(false);

  if (isLoading) return <>loading</>;

  if (error) return <>{`${error}`}</>;

  return (
    <Grid
      templateRows="1"
      templateColumns="repeat(24, 1fr)"
      gap="1rem"
      alignItems="center"
      justifyItems="center"
      bgColor="red.700"
      p="1rem"
      width="90%"
    >
      <GridItem
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        colSpan={2}
        width="100%"
        as="a"
        href={channelFeed.url}
        target="_blank"
        rel="noopener noreferrer"
        title={channelFeed.name}
      >
        <Avatar src={props.subscription.snippet.thumbnails.default.url} />
        <Heading size="md" textAlign="center" wordBreak="break-word">
          {channelFeed.name}
        </Heading>
      </GridItem>
      <GridItem
        colStart={3}
        colSpan={12}
        display="flex"
        flexDirection="column"
        gap="1rem"
        alignItems="start"
        width="100%"
      >
        <Heading size="md">Most Recent Videos</Heading>
        <Flex gap="1rem" alignItems="center" width="100%">
          {channelFeed.videos.slice(0, 3).map((video) => (
            <Video video={video} key={video.url} channelUrl={channelFeed.url} />
          ))}
        </Flex>
      </GridItem>
      {/* <GridItem
        colStart={16}
        colSpan={4}
        display="flex"
        width="100%"
        gap="1rem"
        alignItems="center"
        flexDirection="column"
      >
        <Heading size="md">Last watched by you</Heading>
        <Video channelUrl={channelFeed.url} video={channelFeed.videos[0]} />
      </GridItem> */}
      <GridItem colStart={16}>
        <Button
          bgColor={subscribed ? "red.800" : "gray.300"}
          onClick={(ev) => {
            if (processingOperation === true) return;
            setProcessingOperation(true);
            if (subscribed === true) {
              unsubscribeFromChannel(props.subscription.id).then(() => {
                setSubscribed(false);
                setProcessingOperation(false);
              });
            } else {
              subscribeToChannel(props.subscription).then(() => {
                setSubscribed(true);
                setProcessingOperation(false);
              });
            }
          }}
        >
          {processingOperation
            ? "Processing..."
            : subscribed
            ? "Unsubscribe"
            : "Subscribe"}
        </Button>
      </GridItem>
    </Grid>
  );
}

const unsubscribeFromChannel = (subscriptionId: string) => {
  console.log(`subscription id: ${subscriptionId}`);
  return gapi.client.youtube.subscriptions.delete({ id: subscriptionId });
};

const subscribeToChannel = (subscription: Subscription) => {
  return gapi.client.youtube.subscriptions.insert({
    part: ["id"],
    resource: subscription,
  });
};

const useChannel = (channelId: string) => {
  const feed = useCallback(async () => {
    const responseText = await (
      await fetch(`/api/channelRSS?channelId=${channelId}`)
    ).text();

    const data = new window.DOMParser().parseFromString(
      responseText,
      "text/xml"
    );
    const out = {
      name: data.querySelector("feed > author > name").textContent,
      url: data.querySelector("feed > author > uri").textContent,
      videos: Array.from(data.querySelectorAll("entry")).map((video) => ({
        title: video.querySelector("title").textContent,
        url: video.querySelector("link").getAttribute("href"),
        thumbnail: video.querySelector("thumbnail").getAttribute("url"),
      })),
    };
    return out;
  }, [channelId]);

  const { data, error } = useSWR(`/channel/${channelId}`, feed, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });

  return { channel: data, isLoading: !data && !error, error: error };
};
