import "./globals.css";

export const metadata = {
  title: "Safari Command Center",
  description: "Smart Safari Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
