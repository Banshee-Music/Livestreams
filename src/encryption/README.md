# Tool for encrypting something that can only be decrypted by a Lit Action

This tool encrypts a piece of information with an access control condition such that only a Lit Action
can decrypt it, meaning no individual is able to decrypt it. 

This is ideal for sharing something like an API key. Permissioned users can call the Lit Action to use the API key, but because the decryption of the API key happens within the Lit Action, the users never possess the actual key and hence can't share it with unauthorized users.  

Before running, there are two variables to configure within `index.ts`:

**Note: ts-node-esm requires NodeJS version 20**

```js
const key = '<the information you want to encrypt>';
const litActionIpfsId = '<the ipfs cid of the lit action allowed to decrypt the key>';
```