import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your Dress Point order status and delivery updates in real-time. Enter your order ID to get the latest information.",
  alternates: {
    canonical: "/track-order",
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
