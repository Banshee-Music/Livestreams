import { usePrivy, useWallets } from '@privy-io/react-auth';

export const LoginButton = () => {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const userWalletAddress = wallets.length > 0 ? wallets[0].address : '';

  // Format wallet address to show first 6 and last 4 characters
  const formattedAddress = userWalletAddress
    ? `${userWalletAddress.substring(0, 6)}...${userWalletAddress.substring(userWalletAddress.length - 4)}`
    : '';

  // Disable the button if Privy is not ready or if the user is already authenticated
  const disableLogin = !ready || authenticated;

  return (
    <button className="button" disabled={disableLogin} onClick={login}>
      {authenticated && formattedAddress ? `Logged in as ${formattedAddress}` : "Log in"}
    </button>
  );
};
