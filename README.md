
# Brawl Explorer

Easily explore and export Brawl Stars 3D assets!

![App Screenshot](https://cdn.discordapp.com/attachments/1347393314285944962/1493009533608398899/image.png?ex=69dd68fb&is=69dc177b&hm=5201384262cdcd3e83884bfda3555c3d0ce11f4c204794069b837ee91f76dd31)


## Setup

This project has separate folders for the client and the server. All node module dependencies must be installed in their root directory using ```npm install``` or ```pnpm install```.

The server has more external dependencies in order for the system to work:
- Brawl Stars SC3D folder
- Blender 4.5+ (only if you want the .fbx conversion)
- Wine if you use Linux

Check the environment variables example (`.env.example`), which shows the necessary configuration for each tool and server setup:

```bash
ORIGIN_ALLOWED=["ip2","ip2","ip3"]
PORT=3000
ASSETS_DIRECTORY=Brawl Stars SC3D directory path
BLENDER_DIRECTORY=Blender executable path
```

The client only has one environment variable to configure:
```bash
VITE_API_URL=http://localhost:3000
```

Once you have installed all dependencies and configurations, you can run the entire application by running either ```npm run dev``` or ```pnpm dev``` in both the client and server folders.
## Disclaimer

This project is still in development, so you may encounter bugs or other issues. Please feel free to report them!

## Credits

I built this project using different open-source tools:
- [SCTX-Converter](https://github.com/Daniil-SV/SCTX-Converter) by Daniil-SV
- [Supercell-Flat-Converter](https://github.com/Daniil-SV/Supercell-Flat-Converter) by Daniil-SV
- [model-viewer](https://github.com/google/model-viewer) by Google
- [shadcn/ui](https://github.com/shadcn-ui/ui) by shadcn

