// src/app/utils/litUtils.ts
import { ethers } from 'ethers';
import { LitNodeClient} from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { createSiweMessageWithRecaps, generateAuthSig } from "@lit-protocol/auth-helpers";

const ONE_WEEK_FROM_NOW = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7
  ).toISOString();

interface AuthCallbackParams {
resourceAbilityRequests?: any[];  // Define more specific type if possible
expiration?: string;
uri?: string;
resources?: any;
}

export const getLitNodeClient = async () => {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.Cayenne,
    debug: true
  });
  await litNodeClient.connect();
  return litNodeClient;
};

export const genAuthSig = async (wallet: ethers.Signer, client: LitNodeClient, uri: string, resources: any[]) => {
  let blockHash = await client.getLatestBlockhash();
  const address = await wallet.getAddress();
  const message = await createSiweMessageWithRecaps({
      walletAddress: address,
      nonce: blockHash,
      litNodeClient: client,
      resources,
      expiration: ONE_WEEK_FROM_NOW,
      uri
  });
  return generateAuthSig({
      signer: wallet,
      toSign: message,
      address: address
  });
};

export const genSession = async (wallet: ethers.Signer, client: LitNodeClient, resources: any[]) => {
    return client.getSessionSigs({
        chain: "base",
        resourceAbilityRequests: resources,
        authNeededCallback: async (params: AuthCallbackParams) => {
          if (!params.expiration || !params.resources || !params.uri) {
            throw new Error("All parameters must be defined");
          }
  
          // Ensure resources is always an array, even if it's empty
          const safeResources = params.resourceAbilityRequests || []; // Default to empty array if undefined
          return genAuthSig(wallet, client, params.uri, safeResources);
        }
    });
  };
  
