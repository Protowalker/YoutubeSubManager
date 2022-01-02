import { ChakraProvider } from "@chakra-ui/react";
import Script from "next/script";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
