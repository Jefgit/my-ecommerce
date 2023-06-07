import Link from "next/link"

export default function Header(){
    return(
        <nav className="p-5 bg-emerald-300">
            <Link href={'/'} className="font-bebas text-5xl">
                Gadgets Shop
            </Link>        
        </nav>
    )
}