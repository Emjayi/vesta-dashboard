import { Button } from "@/components/ui/button";
import { Link, ArrowLeft } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="container mx-auto px-4 py-8">
            {children}
        </section>
    );
}