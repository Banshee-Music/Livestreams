//@ts-nocheck
import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { AuthCallbackParams } from "@lit-protocol/types";
import { LIT_RPC } from "@lit-protocol/constants";
import { LitAbility, LitAccessControlConditionResource, LitActionResource, createSiweMessageWithRecaps, generateAuthSig } from "@lit-protocol/auth-helpers";
import {ethers} from 'ethers';
import * as jwt from 'jsonwebtoken';
import { SupportedAlgorithm } from "ethers/lib/utils.js";
import * as siwe from "siwe";
import crypto from 'crypto';

// Information you want to encrypt and the IPFS CID of your lit action
const key = 'c2602e8b-2123-452d-b27e-200c62e2b63d';
const litActionIpfsId = "QmT5Vi5byp1vcjE9gkxdWYz3zmScg3BBoM5wnWcUEqXiF7";

const chain = "moonbase alpha";

const accessControlConditions = [
    {
      contractAddress: '0x1bdBcc6b0Ad296B0b49a488b922b451eDEFb60b0',
      standardContractType: 'ERC721',
      chain: 'moonbase alpha',
      method: 'balanceOf',
      parameters: [':currentActionIpfsId'],
      returnValueTest: {
        comparator: '=',
        value: litActionIpfsId,
      },
    },
  ];

const ONE_WEEK_FROM_NOW = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7
).toISOString();

const genProvider = () => {
    return new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);
}

const genWallet = () => {
// known private key for testing
// replace with your own key
return new ethers.Wallet('e380c49660aab954c08cf8aa6810d4426a73b370cac94b64ee42168634e649ff', genProvider());
}

const main = async () => {
    let client = new LitNodeClient({
        litNetwork: 'datil-dev',
        debug: true
    });

    const wallet = genWallet();
    await client.connect();
    /*
    Here we are encypting our key for secure use within an action
    this code should be run once and the ciphertext and dataToEncryptHash stored for later sending
    to the Lit Action in 'jsParams'
    */
    const { ciphertext, dataToEncryptHash } = await encryptString(
        {
            accessControlConditions,
            dataToEncrypt: key,
        },
        client
    );

    console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);

client.disconnect();
}

await main();
