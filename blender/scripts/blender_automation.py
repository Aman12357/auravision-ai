"""
AuraVision AI — Blender Automation API Bridge
Programmatically constructs 3D project scenes, meshes, materials, lighting, camera trajectories, and render outputs.
Can run inside Blender via `blender --background --python blender_automation.py -- --plan project_plan.json`
"""

import sys
import os
import json

try:
    import bpy
    import mathutils
    IS_BLENDER = True
except ImportError:
    IS_BLENDER = False

class BlenderAutomationService:
    def __init__(self, plan_file="project_plan.json"):
        self.plan_file = plan_file
        self.plan = self.load_plan()

    def load_plan(self):
        if os.path.exists(self.plan_file):
            with open(self.plan_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"title": "Default 3D Scene", "durationSeconds": 30, "fps": 30}

    def build_scene(self, output_blend="output_project.blend", output_render="render_output.mp4"):
        if not IS_BLENDER:
            print(f"[BlenderAutomation] Simulation Mode: Scene '{self.plan.get('title')}' created for plan {self.plan_file}.")
            return True

        # Clear existing scene
        bpy.ops.wm.read_factory_settings(use_empty=True)
        scene = bpy.context.scene
        scene.name = "AuraVision_Main_Scene"
        scene.render.fps = self.plan.get("fps", 30)
        scene.frame_start = 1
        scene.frame_end = self.plan.get("durationSeconds", 30) * scene.render.fps

        # 1. Create Camera
        cam_data = bpy.data.cameras.new(name="Aura_Camera")
        cam_data.lens = 35
        cam_obj = bpy.data.objects.new("Aura_Camera", cam_data)
        scene.collection.objects.link(cam_obj)
        scene.camera = cam_obj
        cam_obj.location = (0, -8, 2)
        cam_obj.rotation_euler = (1.4, 0, 0)

        # 2. Create Cinematic 3-Point Lighting
        key_light = bpy.data.lights.new(name="Key_Light", type='AREA')
        key_light.energy = 1000
        key_obj = bpy.data.objects.new("Key_Light", key_light)
        key_obj.location = (4, -4, 5)
        scene.collection.objects.link(key_obj)

        fill_light = bpy.data.lights.new(name="Fill_Light", type='POINT')
        fill_light.energy = 500
        fill_light.color = (0.02, 0.7, 0.8) # Neon Cyan
        fill_obj = bpy.data.objects.new("Fill_Light", fill_light)
        fill_obj.location = (-5, -2, 3)
        scene.collection.objects.link(fill_obj)

        # 3. Create Ground Plane (Wet Neon City Road)
        bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
        ground = bpy.context.active_object
        ground.name = "City_Road"

        ground_mat = bpy.data.materials.new(name="Wet_Asphalt")
        ground_mat.use_nodes = True
        bsdf = ground_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs['Base Color'].default_value = (0.05, 0.05, 0.08, 1)
            bsdf.inputs['Roughness'].default_value = 0.1 # High reflection wet surface
            bsdf.inputs['Metallic'].default_value = 0.2
        ground.data.materials.append(ground_mat)

        # 4. Create Main 3D Robot Character Mesh
        bpy.ops.mesh.primitive_cube_add(size=1.5, location=(0, 0, 1))
        robot = bpy.context.active_object
        robot.name = "Aura_Robot"

        robot_mat = bpy.data.materials.new(name="Cyber_Armor")
        robot_mat.use_nodes = True
        r_bsdf = robot_mat.node_tree.nodes.get("Principled BSDF")
        if r_bsdf:
            r_bsdf.inputs['Base Color'].default_value = (0.02, 0.8, 0.9, 1) # Cyan Armor
            r_bsdf.inputs['Metallic'].default_value = 0.9
            r_bsdf.inputs['Roughness'].default_value = 0.2
        robot.data.materials.append(robot_mat)

        # 5. Add Keyframe Walk & Camera Motion Animation
        for f in range(scene.frame_start, scene.frame_end + 1):
            t = f / scene.render.fps
            # Robot walking forward
            robot.location.y = -3.0 + t * 0.4
            robot.location.z = 1.0 + abs(mathutils.math.sin(t * 5.0)) * 0.1
            robot.keyframe_insert(data_path="location", frame=f)

            # Camera pan trajectory
            cam_obj.location.x = mathutils.math.sin(t * 0.5) * 2.0
            cam_obj.keyframe_insert(data_path="location", frame=f)

        # Save Editable .blend File
        bpy.ops.wm.save_as_mainfile(filepath=output_blend)
        print(f"[BlenderAutomation] Editable project saved to {output_blend}")

        # Render Settings
        scene.render.image_settigns.file_format = 'FFMPEG' if hasattr(scene.render, 'image_settigns') else 'PNG'
        scene.render.filepath = output_render
        print(f"[BlenderAutomation] Scene constructed successfully.")
        return True

if __name__ == '__main__':
    plan_path = "project_plan.json"
    if "--plan" in sys.argv:
        idx = sys.argv.index("--plan")
        if idx + 1 < len(sys.argv):
            plan_path = sys.argv[idx + 1]

    service = BlenderAutomationService(plan_file=plan_path)
    service.build_scene()
