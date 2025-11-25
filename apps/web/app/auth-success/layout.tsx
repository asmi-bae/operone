import type { Metadata } from "next";
import Header from "@/components/sections/header"
import Footer from "@/components/sections/footer"

export const metadata: Metadata = {
  title: "Authentication Success - Operone",
  description: "Successfully authenticated with Operone",
  icons: {
    icon: "/logo/passkey.svg",
  },
};

export default function AuthSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
