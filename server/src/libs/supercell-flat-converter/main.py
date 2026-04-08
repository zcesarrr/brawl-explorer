import os
import json
import argparse
from lib.glTF import glTF, ObjectProcessor
from lib.odin import SupercellOdinGLTF

debug = False


def decode(input_file: str, output_file: str, post_process: bool):
    print(f"Working on \"{os.path.basename(input_file)}\"", end='')
    gltf = glTF()

    try:
        with open(input_file, "rb") as file:
            gltf.read(file.read())
    except ValueError as e:
        print(f"Error: {e}")
        print(f"Failed to read file \"{input_file}\"")
        return

    for chunk in gltf.chunks:
        chunk.deserialize_json()

    if (post_process):
        odin = SupercellOdinGLTF(gltf)
        gltf = odin.process()

    if debug:
        for chunk in gltf.chunks:
            if chunk.name != "JSON":
                continue

            debug_output = output_file + ".json"
            with open(debug_output, "wb") as file:
                if (isinstance(chunk.data, bytes)):
                    file.write(chunk.data)
                else:
                    file.write(
                        bytes(json.dumps(chunk.data, cls=ObjectProcessor, indent=4), "utf8"))
            break

    print(f"\rSuccessful: \"{os.path.basename(input_file)}\"")

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    
    with open(output_file, "wb") as file:
        file.write(gltf.write())


def encode(input_file: str, output_file: str):
    print(f"Reading: {os.path.basename(input_file)}")
    gltf = glTF()

    with open(input_file, "rb") as file:
        gltf.read(file.read())

    for chunk in gltf.chunks:
        chunk.serialize_json()

    if debug:
        debug_output = input_file + ".bin"
        with open(debug_output, "wb") as file:
            file.write(
                [chunk.data for chunk in gltf.chunks if chunk.name == "FLA2"][0]
            )

    print(f"Successful: {os.path.basename(input_file)}")

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    
    with open(output_file, "wb") as file:
        file.write(gltf.write())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog="scglTF Converter", 
        description="Tool for converting Supercell glTF files to usual ones and vice versa"
    )

    parser.add_argument("mode", type=str, choices=["decode", "decodeRaw", "encode"],
                        help="Conversion mode")
    parser.add_argument("-i", "--input", type=str, required=True,
                        help="Input file path")
    parser.add_argument("-o", "--output", type=str, required=True,
                        help="Output file path")

    args = parser.parse_args()
    
    if (args.mode == "decode"):
        decode(args.input, args.output, post_process=True)
    elif (args.mode == "decodeRaw"):
        decode(args.input, args.output, post_process=False)
    elif (args.mode == "encode"):
        encode(args.input, args.output)
