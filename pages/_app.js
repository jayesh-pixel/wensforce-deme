import ToastMessage from "@/components/ToasterMSG";
import { AuthProvider } from "@/context/AuthContext";
import { FilterProvider } from "@/context/FilterContext";
import ServiceProvider from "@/context/ServiceContext";
import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
 
      <ServiceProvider>
        <AuthProvider>
          <FilterProvider>
          <Head>
            <link rel="icon" type="image/png" href="/Wens-force-logo.png" />
            <title>WENS Force</title>
          </Head>
          <Component {...pageProps} />
          </FilterProvider>
        </AuthProvider>
        <ToastMessage />
      </ServiceProvider>
   
  );
}
