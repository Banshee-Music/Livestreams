"use client"
import { useEffect, useState } from 'react';
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import { LitAbility, LitAccessControlConditionResource, LitActionResource} from "@lit-protocol/auth-helpers";
import { ethers } from 'ethers';  // Import Signer correctly
import { DemoPlayer } from "@/app/components/DemoPlayer";
import { Src } from '@livepeer/react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { LoginButton } from './components/LoginButton';
import { LogoutButton } from './components/LogoutButton';
import { getLitNodeClient, genSession, genAuthSig } from './utils/litUtils';
import { getPlaybackInfo } from './utils/livepeerUtils';

//Inputs for calling Lit Action
const chain = "moonbase alpha";
const litActionIpfsId = 'QmT5Vi5byp1vcjE9gkxdWYz3zmScg3BBoM5wnWcUEqXiF7';

//Encrypted private key for signing JWT. Can only be decrypted by Lit Action
const ciphertext = 's/XIL+d7AMGCLngpzu/y/mmKox2xfOgoNKWfSyfLHTqrP2wUx9z1kiBqeCsYLQUuj6JFQZXeL7orZOwn2joiyisIZ+DYIjZc1czK/8xrl8vGAnpE34O4q0193aBC1yCMXRnHxbcpAnEnT0IxOn/Hx5jvh8sBy6QoCpP0H2SNVOUY3fpraQwO+Z8/L4jR89fzDbqSPwHXpkaPnadBSuiV140rndQEQYyEJRzUfkDPeC/heZUjuY0V+9kZcYoZiW1GD9FCAHA4eCzN5N+udh/B0srcInmBypO0PfnVX+WEHgoDUz2sMrytTQQaGCZKYVr9PTbjksVK7MJ1oQx6nyq+/p2EozBODoA7MUaZpXyRhY9CsgTQlmDXahnlUEidfNKTzkNGaYX9CxIpZWB6wtvu2HU7MPT4WlLTCAnAvW0pWgz/1D4OG1XEdyv9GbPKU51Ty6AmHL9DaKkb/KSlnXb0ZUExMxVfGzF7/tlnU3acjD7mhZX2VcnV8B5SkYG6HDysYrYL9GSvvFL7r5P+i+LnmUb0Ew/PgfvBAg==';
const dataToEncryptHash = 'e3d31f0824b9b959a28f374d993279a4a182917fd335374a718611e790239f4b';

//Video player input. Can use an Livepeer API Key. 
const livepeerApiKey = process.env.LIVEPEER_SECRET_API_KEY ?? "";
const playbackId = "a1c8lfbi02w5rb7y";


const accessControlConditions = [
  {
    contractAddress: '0x1bdBcc6b0Ad296B0b49a488b922b451eDEFb60b0',
    standardContractType: 'ERC721',
    chain: chain,
    method: 'balanceOf',
    parameters: [':currentActionIpfsId'],
    returnValueTest: {
      comparator: '=',
      value: litActionIpfsId,
    },
  },
];

const Home = () => {
  //States for managing a basic UX
  const [showVideoButton, setShowVideoButton] = useState(false);
  const [videoSrc, setVideoSrc] = useState<Src[] | null>(null); // State to store video source
  const [signedJWT, setSignedJWT] = useState('');  // State to hold the signed JWT
  const [loading, setLoading] = useState(false);  // State to handle loading
  const [errorMessage, setErrorMessage] = useState('');

  //Privy globals
  const { authenticated} = usePrivy();
  const { wallets } = useWallets();
  const userWallet = wallets[0];

  //Logic for making sure Lit client doesn't stay open between loads
  useEffect(() => {
    // Call disconnectWeb3 when the component mounts
    disconnectWeb3();
    console.log('Disconnected Web3 provider on component mount.');
  }, []); // Empty dependency array ensures this effect runs only once on mount

  //Logic for showing the video player if Lit Action works (aka you get a signed JWT)
  useEffect(() => {
    if (signedJWT && !videoSrc) {
      getPlaybackInfo(playbackId, livepeerApiKey).then(playbackResponse => {
        setVideoSrc(playbackResponse);
        if (playbackResponse) {
          setShowVideoButton(true); 
        }
      });
    } else {
      console.log("Waiting on JWT or Video Source:", { jwt: signedJWT, src: videoSrc });
    }
  }, [signedJWT, videoSrc]);

  //Logic for UX when you log out
  useEffect(() => {
    // Reset state when user logs out
    if (!authenticated) {
      setShowVideoButton(false);
      setSignedJWT('');
      setVideoSrc(null);
    }
  }, [authenticated]);

  //Creates authsig and session sig, then calls the Lit Action to retrieve signed JWT
  const handleCheckAccess = async () => {
    try {
      setLoading(true);  // Start loading

      //Connect Lit Node Client
      let litNodeClient = await getLitNodeClient();
     
      // Wrap the EIP-1193 provider with ethers and get the signer from the ethers provider
      const userSigner = await userWallet.getEthereumProvider();
      const provider = new ethers.providers.Web3Provider(userSigner);
      const signer = provider.getSigner();

      // Set up parameters for Session Signature
      let sessionForDecryption;  
      const accsResourceString = 
        await LitAccessControlConditionResource.generateResourceString(accessControlConditions as any, dataToEncryptHash);
      const resources = [
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
        {
            resource: new LitAccessControlConditionResource(accsResourceString),
            ability: LitAbility.AccessControlConditionDecryption,
    
        }
      ];
      
      // Generate session sig
      if(userSigner) {
        sessionForDecryption = await genSession(signer, litNodeClient, resources);
        console.log("session sigs: ", sessionForDecryption);
      }

      // Generate a seperate auth sig, which is used in the lit action for checking NFT ownership
      const authSig = await genAuthSig(signer, litNodeClient, origin, resources);
      console.log(authSig);

      // Execute the Lit Action. 
      // First checks the authsig to verify you're the owner of the NFT
      // Second decrypts the private key and signs a JWT (passed as res.response)
      const res = await litNodeClient.executeJs({
        sessionSigs: sessionForDecryption,
        ipfsId: litActionIpfsId,
        jsParams: {
          accessControlConditions,
          ciphertext,
          dataToEncryptHash,
          authSig: authSig,
          chain
        }
      });
      console.log("result from action execution: ", res);
      // Check if res.response is a non-empty string
      if (typeof res.response === 'string' && res.response.trim() !== '') {
        setSignedJWT(res.response);  // Update the JWT
        setErrorMessage('');  // Clear any error messages
      } else {
        setErrorMessage('ERROR: Access Denied');  // Handle the empty string case
      }
      } catch (error) {
        console.error('Failed to check access:', error);
              setErrorMessage('ERROR: Access Denied');  // Handle the error case
          } finally {
              setLoading(false);  // Stop loading regardless of the outcome
          }
    };

    return (
    <div style={{ backgroundColor: 'lightsteelblue'}}>
        <h1 style={{ textAlign: 'center', fontSize: '36px', marginTop: '20px', fontWeight: 'bold' }}>
          Pete Myers Live in Istanbul!
        </h1>
        <center>
        <img src="PetemyersQRcode.png"  alt="Live"></img>
        </center>
        <div style={{ maxWidth: '600px', margin: 'auto', textAlign: 'center', color: 'blueviolet' }}>
          <div style={{ marginTop: '20px' }}>
            <strong>Step 1: Purchase Your Ticket</strong><br />
            Go <a href="https://banshee-music.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0000EE' }}>here</a> to purchase your ticket to the performance.
          </div>
          <div style={{ marginTop: '20px' }}>
            <strong>Step 2: Connect Wallet</strong>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
              <LoginButton/>
              <LogoutButton/>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <strong>Step 3: Get Access</strong>
            <p>Press the button below to get access to Pete Myers livestream performance.</p>
            <button type="button" onClick={handleCheckAccess} style={{ display: 'block', margin: '20px auto', background: 'grey', border: 'none', borderRadius: '8px', padding: '10px 20px', color: 'white', cursor: 'pointer' }}>
              {loading ? 'Entering...' : 'Get Access'}
            </button>
          </div>
          {errorMessage && (
            <div style={{ color: 'red', marginTop: '20px' }}>{errorMessage}</div>
          )}
          {showVideoButton && videoSrc && signedJWT && authenticated && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DemoPlayer src={videoSrc} jwt={signedJWT} />
            </div>
          )}
        </div>
    </div>
    );

  };

export default Home;
