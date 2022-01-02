import { useCallback, useRef, useState } from "react";
import { GoogleLoginResponse } from "react-google-login";
import YoutubeLogin from "../public/Components/YoutubeLogin";
import YoutubeSubscriptionManager from "../public/Components/YoutubeSubscriptionManager";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const oauthIdRef = useRef("");

  const onLogin = useCallback((response: GoogleLoginResponse) => {
    setLoggedIn(true);
    oauthIdRef.current = response.getAuthResponse().access_token;
  }, []);
  const onLogout = useCallback(() => {
    setLoggedIn(false);
  }, []);

  return (
    <div className={styles.container}>
      <YoutubeLogin
        isLoggedIn={loggedIn}
        onLoginSuccess={onLogin}
        onLogoutSuccess={onLogout}
      />
      {loggedIn ? <YoutubeSubscriptionManager /> : null}
    </div>
  );
}
