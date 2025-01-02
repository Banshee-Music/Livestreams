import Livepeer from "livepeer";
import { getSrc } from "@livepeer/react/external";

const livepeer = new Livepeer({
  apiKey: process.env.LIVEPEER_SECRET_API_KEY,
});

const playbackId = "d3ff6iptj4i1ofzj";

export const getPlaybackSource = async () => {
  const playbackInfo = await livepeer.playback.get(playbackId);

  const src = getSrc(playbackInfo.playbackInfo);

  return src;
};
