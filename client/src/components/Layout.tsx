import { ShareProvider } from "@/contexts/ShareContext";
import Header from "./Header";
import { Footer } from "react-day-picker";

export default function Layout({ children }) {
  return (
    <ShareProvider>
      <div>
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </ShareProvider>
  );
}
