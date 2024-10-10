import { usePathname } from "next/navigation";

export function Path() {
    const pathname = usePathname();
    
    return pathname;
}
