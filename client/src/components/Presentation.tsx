import { Badge } from "./ui/badge";

export default function Presentation() {
    return (
        <div className="flex flex-col w-full h-full justify-center items-center text-neutral-500 text-center">
            <div className="flex flex-1 flex-col items-center justify-center gap-2 mt-8">
                <div className="flex items-center justify-center gap-2">
                    <h1 className="text-3xl">Brawl Project</h1>
                    <Badge className="mt-1 rounded-none" variant="outline">Beta</Badge>
                </div>
                <h2>
                    A web tool to visualize and explore Brawl Stars assets
                </h2>
                {/*<h3 className="items-2">
                    Made by {" "}
                        <a 
                            href="https://x.com/cessjr_" 
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:underline text-neutral-300"
                        >
                            Cess
                        </a>
                </h3>*/}
            </div>
            <p className="px-4 pb-4 text-xs">
                This material is unofficial and is not endorsed by Supercell. For more information see Supercell's Fan Content Policy: {" "}
                <a 
                    href="https://www.supercell.com/fan-content-policy" 
                    target="_blank" 
                    rel="noreferrer noopener"
                    className="text-neutral-400 underline"
                >
                    www.supercell.com/fan-content-policy.
                </a>
            </p>
        </div>
    );
}
