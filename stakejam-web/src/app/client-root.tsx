"use client";
import Providers from "./providers";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
