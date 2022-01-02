import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const channelId = req.query.channelId;

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  const response = await (await fetch(rssUrl)).text();
  res.status(200).send(response);
}
