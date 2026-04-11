import { Separator } from "./ui/separator";

export default function Information() {
    return (
        <>
            <div>
                <strong>Open source software used:</strong>
                <ul className="flex flex-col gap-4">
                <Attribution 
                    title="SCTX-Converter - by Daniil-SV"
                    link="https://github.com/Daniil-SV/SCTX-Converter"
                />
                <Attribution 
                    title="Supercell-Flat-Converter - by Daniil-SV"
                    link="https://github.com/Daniil-SV/Supercell-Flat-Converter"
                />
                <Attribution
                    title="model-viewer - by Google"
                    link="https://github.com/google/model-viewer"
                    license="Apache-2.0 license"
                />
                <Attribution
                    title="shadcn/ui - by shadcn"
                    link="https://github.com/shadcn-ui/ui"
                    license="MIT license"
                />
                </ul>
            </div>
            <Separator className="my-2"/>
            <p>
                Brawl Explorer built by {" "}
                <a 
                href="https://x.com/cessjr_" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline font-semibold"
                >
                Cess
                </a>
            </p>
            <strong>This application is still in development</strong>
        </>
    )
}

function Attribution({ title, license, link }: { title: string, license?: string, link: string }) {
  return (
    <li>
      <p>{title}</p>
      {license && <p>Licensed under the {license}</p>}
      <a href={link} target="_blank" rel="noopener noreferrer" className="underline font-semibold">{link}</a>
    </li>
  );
}

