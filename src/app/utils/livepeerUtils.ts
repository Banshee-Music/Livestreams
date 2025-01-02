// src/app/utils/livepeerUtils.ts
import { Livepeer } from "livepeer";
import { getSrc } from "@livepeer/react/external";
import { Src } from '@livepeer/react';

// Function to create a Livepeer instance
export const createLivepeerInstance = (apiKey: string): Livepeer => {
  return new Livepeer({ apiKey });
};

// Function to fetch playback info
export const getPlaybackInfo = async (playbackId: string, apiKey: string): Promise<Src[] | null> => {
  const livepeer = createLivepeerInstance(apiKey);
  try {
    const playbackInfo = await livepeer.playback.get(playbackId);
    return getSrc(playbackInfo.playbackInfo);
  } catch (error) {
    console.error("Failed to fetch playback info:", error);
    return null;
  }
};
