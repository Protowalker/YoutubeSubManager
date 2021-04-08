import Head from 'next/head';
import styles from '../styles/Home.module.css';
import GoogleLogin, { GoogleLoginResponse, GoogleLogout } from 'react-google-login';
import React, {useState} from 'react';
import {YoutubeChannelListing, YoutubeChannelListings} from '../public/js/YTComponents';
import 'fontsource-roboto';

const clientId = "252186586352-o400n6bsvfn9iv42jd6nh8qp4ehuhl37.apps.googleusercontent.com";



function onGoogleFailure(): void {
  alert("login failed");
}


interface HomeState {
  loggedIn: boolean;
  oAuthToken: string;
}

export default class Home extends React.Component<{}, HomeState> {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      oAuthToken: ""
    };

    this.onLoginSuccess = this.onLoginSuccess.bind(this);
    this.onLogoutSuccess = this.onLogoutSuccess.bind(this);
  }


  render() {
    return (
    <>
      <Head>
        <script type="text/javascript" src="/js/googleapi.js"></script>
      </Head>
      <YoutubeLogin isLoggedIn={this.state.loggedIn} onLoginSuccess={this.onLoginSuccess} onLogoutSuccess={this.onLogoutSuccess}/>
      <YoutubeChannelListings isLoggedIn={this.state.loggedIn}/>
    </>);
  }

  onLoginSuccess(response: GoogleLoginResponse): void {
    this.setState({
      oAuthToken: response.getAuthResponse().access_token,
      loggedIn: true  });
    
  }

  onLogoutSuccess(): void {
    this.setState({
      oAuthToken: "",
      loggedIn: false  });
  }
}




function YoutubeLogin(props) {
  if(props.isLoggedIn == false) {
    return (
      <GoogleLogin
        clientId={clientId}
        buttonText="Log in to google"
        onSuccess={props.onLoginSuccess}
        onFailure={onGoogleFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
      />
    );
  } else {
    return (
      <GoogleLogout onLogoutSuccess={props.onLogoutSuccess} clientId={clientId}/>

    );
  }
}
