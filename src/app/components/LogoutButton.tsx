import {usePrivy} from '@privy-io/react-auth';

export const LogoutButton = () => {
  const {ready, authenticated, logout} = usePrivy();
  // Disable logout when Privy is not ready or the user is not authenticated
  const disableLogout = !ready || (ready && !authenticated);

  return (
    <button className="button"disabled={disableLogout} onClick={logout}>
      Log out
    </button>
  );
}