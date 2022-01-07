import { Box, GridItem, Image, Text } from "@chakra-ui/react";

export default function Video(props: {
  video: { title: string; url: string; thumbnail: string };
  channelUrl: string;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      as="a"
      href={props.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={props.video.title}
    >
      <Box pb="56.25%" overflow="hidden" position="relative">
        <Box position="absolute" top="-16.75%" bottom="0" left="0" right="0">
          <Image src={props.video.thumbnail} />
        </Box>
      </Box>
      <Text textOverflow="ellipsis" noOfLines={1} textAlign="center">
        {props.video.title}
      </Text>
    </Box>
  );
}
