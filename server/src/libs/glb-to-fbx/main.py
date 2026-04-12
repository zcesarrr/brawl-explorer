# USAGE: blender --background --factory-startup --python convert.py -- input.glb output.fbx

import bpy # type: ignore
import sys

argv = sys.argv
argv = argv[argv.index("--") + 1:]

input_file = argv[0]
output_file = argv[1]

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

bpy.ops.import_scene.gltf(filepath=input_file)

bpy.ops.export_scene.fbx(
    filepath=output_file,
    use_selection=False,
    apply_scale_options='FBX_SCALE_ALL'
)

print("Done")