import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Wellyo | Tu bienestar. A tu manera.", description: "Seguimiento personal de nutrición, movimiento, cuerpo y hábitos." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
