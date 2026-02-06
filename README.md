BANSHEE uses both Lit Protocol and Livepeer

### Decentralized token gated video using Lit Protocol and Livepeer

This project demonstrates a video hosted on Livepeer that is token gated using Lit Protocol.


The token gate uses a signed JWT for access control. The private key used to sign it is encrypted by Lit Protocol. The key can only be decrypted within a Lit Action with the help of Lit's new [decrypt and combine function](https://developer.litprotocol.com/sdk/serverless-signing/combining-decryption-shares). The lit action is stored on IPFS here: https://ipfs.io/ipfs/QmWA1StRHhyLVredACLN7vra35Dyv4jUSQ5rzsVhovLcf4. 


When the user calls the lit action, it does the following:

1. Check if the user is allowed to sign a JWT. This is done using a hardcoded access control condition. For this project, we check if the user holds a specific ERC721 NFT. 
2. If the user is authorized, decrypt the private key and sign a JWT
3. Return signed JWT to the user

Because the decryption of the private key happens within the lit action, the user can't steal the key and distribute it to unauthorized users. This allows the entire application runs client side.  


### Step 1: Generate public and private key for for JWT access control

You can generate the keys here: https://docs.livepeer.org/api-reference/signing-key/create. Enter your Livepeer API key as input. 


### Step 2: Upload video to Livepeer

You can use [this script](https://github.com/serdave-eth/livepeer-upload-video) for uploading your video to Livepeer with JWT playback restrictions. Make sure to use "upload_jwt.js". 


### Step 3: Create Lit Action for signing JWT

The lit action for this project can be found here: https://ipfs.io/ipfs/QmWA1StRHhyLVredACLN7vra35Dyv4jUSQ5rzsVhovLcf4. 

To use this action for another video, go to [Lit Block Explorer](https://explorer.litprotocol.com/create-action) and c/p it in the main form. Before uploading it to IPFS, you need to change the following variables:

```
const e = "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFcXdQWXlIMCtoSndLQ0RpalRlMzZFK1NYR2c3ZQpic3oxbW5VNEVUNUNZdWhycW1DWVF5QVl3SmF4aFBEZnFKbDdCL2JEeCtQcHNkMFRiSE9YWFdjZUt3PT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg=="
```

This is your Livepeer public key. Make sure not to put your private key here! That is what remains encrypted.

```
r = [{
                contractAddress: "0x13dfaF990cE5176e01dcaDc932EB71756072DB27",
                standardContractType: "ERC721",
                chain: chain,
                method: "balanceOf",
                parameters: [":userAddress"],
                returnValueTest: { comparator: ">", value: "0" }
            }];
```

This defines who is authorized to get a signed JWT (and therefore watch the video). In this example, anyone who holds the ERC721 NFT from contract address 0x13dfaF990cE5176e01dcaDc932EB71756072DB27 is authorized to get a signed JWT. You can use [different conditions](https://developer.litprotocol.com/sdk/access-control/lit-action-conditions) but make sure the condition is 100% hardcoded into the lit action.


### Step 4: Encrypt private key

You can use [this script](https://github.com/serdave-eth/lit-encrypt). Before running it, read the instructions.


### Step 5: Play video

There are a few variables at the top of page.tsx that you need to update for your application:


chain: which chain your NFT is on.

ciphertext and dataToEncryptHash: outputs from step 4.

livepeerApiKey: your livepeer API key

playbackId: the playbackId of the video you want to view


### Steps to run this project

Follow these steps:

```
npm install

npm run build

npm start
```

Go to http://localhost:3000/. 
