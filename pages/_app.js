import "../styles/globals.css"; // Ensure your global styles are imported
import { AuthContextProvider } from "../context/AuthContext";
import { Toaster } from "sonner";

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <Component {...pageProps} />
      <Toaster position="bottom-right" theme="dark" richColors />
    </AuthContextProvider>
  );
}

export default MyApp;
