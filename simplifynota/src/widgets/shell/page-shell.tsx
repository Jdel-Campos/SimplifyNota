"use client";

import { Header } from "./header";
import { Footer } from "./footer";

export function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
        </div>
    );
};