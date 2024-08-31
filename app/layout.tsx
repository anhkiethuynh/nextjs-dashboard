import { Metadata } from "next";
import { inter } from "./ui/fonts";
import "./ui/global.css";

export const metadata: Metadata = {
  // title: "Acme Dasboard",
  title: {
    template: "%s | Acme Dashboard",
    default: "Acme Dashboard",
  },
  description: "The official Next.js Course Dashboard, build with App Router",
  metadataBase: new URL("https://nextjs-dashboard-jet-iota-71.vercel.app/"),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
