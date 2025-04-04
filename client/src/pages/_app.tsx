import { ShareProvider } from "@/contexts/ShareContext";

function MyApp({ Component, pageProps }) {
  return (
    <ShareProvider>
      <Component {...pageProps} />
    </ShareProvider>
  );
}

export default MyApp;
