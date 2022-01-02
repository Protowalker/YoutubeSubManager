import GoogleLogin, { GoogleLoginResponse, GoogleLogout } from "react-google-login";

const clientId = "252186586352-o400n6bsvfn9iv42jd6nh8qp4ehuhl37.apps.googleusercontent.com";

function onGoogleLoginFailure(err: unknown): void {
    console.error(err);
  }
  

export default function YoutubeLogin(props: {isLoggedIn: boolean, onLoginSuccess: (response: GoogleLoginResponse) => void, onLogoutSuccess: () => void}) {
    if(props.isLoggedIn === false) {
    return (
        <GoogleLogin
          clientId={clientId}
          buttonText="Log in to google"
          onSuccess={(response) => props.onLoginSuccess(response as GoogleLoginResponse)}
          onFailure={onGoogleLoginFailure}
          cookiePolicy={'single_host_origin'}
          scope="https://www.googleapis.com/auth/youtube"
        />
      );
    } else {
      return (
        <GoogleLogout onLogoutSuccess={props.onLogoutSuccess} clientId={clientId}/>
  
      );
    }
}