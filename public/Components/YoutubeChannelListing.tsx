import {
  Avatar,
  Box,
  Grid,
  GridItem,
  Heading,
  Image,
  LinkOverlay,
  Text,
} from "@chakra-ui/react";
import { useCallback } from "react";
import useSWR from "swr";
import { YoutubeChannel } from "../Interfaces/YoutubeInterfaces";

export default function YoutubeChannelListing(props: {
  channel: YoutubeChannel;
}) {
  const {
    channel: channelFeed,
    isLoading,
    error,
  } = useChannel(props.channel.snippet.resourceId.channelId);

  if (isLoading) return <>loading</>;

  if (error) return <>{`${error}`}</>;

  return (
    <Grid
      width="100%"
      templateRows="1"
      templateColumns="repeat(12, 1fr)"
      gap="1rem"
      alignItems="center"
      justifyItems="center"
      bgColor="red.700"
      p="1rem"
    >
      <a href={channelFeed.url} target="_blank" rel="noopener noreferrer">
        <GridItem
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          colSpan={1}
        >
          <Avatar
            src={props.channel.snippet.thumbnails.default.url}
            size="xl"
          />
          <Heading size="md" textAlign="center">
            {channelFeed.name}
          </Heading>
        </GridItem>
      </a>

      {channelFeed.videos.slice(0, 3).map((video) => (
        <GridItem
          flexDirection="column"
          key={video.url}
          colSpan={2}
          justifySelf="stretch"
        >
        <a href={channelFeed.url}  target="_blank" rel="noopener noreferrer">
          <Box pb="56.25%" overflow="hidden" position="relative">
            <Box
              position="absolute"
              top="-16.75%"
              bottom="0"
              left="0"
              right="0"
            >
              <Image src={video.thumbnail} />
            </Box>
          </Box>
          <Text textOverflow="ellipsis" noOfLines={1}>
            {video.title}
          </Text>
        </a>
        </GridItem>
      ))}
    </Grid>
  );
}

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
