import os
import json
import argparse
import urllib.request
import urllib.parse

class AuraDirector:
    def __init__(self, ollama_url="http://localhost:11434"):
        self.ollama_url = ollama_url

    def parse_prompt_to_plan(self, prompt_text, duration=30, style="cinematic 3d"):
        """Converts user natural language prompt into a structured 3D project plan JSON."""
        system_prompt = (
            "You are AuraDirector, the principal AI director of AuraVision AI. "
            "Convert user prompts into a valid 3D project JSON specification."
        )
        
        user_msg = f"""User Request: "{prompt_text}"
Duration: {duration} seconds
Style: {style}

Return ONLY valid JSON matching this schema:
{{
  "title": "Short Title",
  "durationSeconds": {duration},
  "fps": 30,
  "style": "{style}",
  "characters": [
    {{
      "id": "char-1",
      "name": "Character Name",
      "type": "ROBOT|HUMAN|ANIMAL|CREATURE",
      "primaryColor": "#06B6D4",
      "secondaryColor": "#38BDF8"
    }}
  ],
  "environments": [
    {{
      "id": "env-1",
      "type": "CYBERPUNK_CITY|LAB|FOREST|SPACE|OCEAN",
      "timeOfDay": "NIGHT|DAY|SUNSET",
      "weather": "RAIN|FOG|CLEAR"
    }}
  ],
  "scenes": [
    {{
      "sceneId": 1,
      "duration": 15,
      "camera": {{ "type": "PAN_RIGHT", "focalLength": 35 }},
      "action": "Description of scene 1 action"
    }},
    {{
      "sceneId": 2,
      "duration": 15,
      "camera": {{ "type": "ORBIT_360", "focalLength": 50 }},
      "action": "Description of scene 2 action"
    }}
  ]
}}"""

        try:
            req_data = json.dumps({
                "model": "llama3",
                "prompt": f"{system_prompt}\n\n{user_msg}",
                "stream": False
            }).encode('utf-8')
            
            req = urllib.request.Request(f"{self.ollama_url}/api/generate", data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=10) as response:
                res = json.loads(response.read().decode('utf-8'))
                raw_response = res.get('response', '')
                # Extract JSON substring
                start = raw_response.find('{')
                end = raw_response.rfind('}') + 1
                if start != -1 and end != -1:
                    return json.loads(raw_response[start:end])
        except Exception as e:
            print(f"[AuraDirector] Offline fallback plan generated. Error: {e}")

        # Rule-based fallback if local LLM is offline
        detected_type = "ROBOT"
        if "dragon" in prompt_text.lower():
            detected_type = "CREATURE"
        elif "car" in prompt_text.lower():
            detected_type = "VEHICLE"

        return {
            "title": "AuraVision 3D Project",
            "durationSeconds": duration,
            "fps": 30,
            "style": style,
            "characters": [
                {
                    "id": "char-main",
                    "name": "Main Character",
                    "type": detected_type,
                    "primaryColor": "#06B6D4",
                    "secondaryColor": "#38BDF8"
                }
            ],
            "environments": [
                {
                    "id": "env-main",
                    "type": "CYBERPUNK_CITY" if "city" in prompt_text.lower() else "SPACE",
                    "timeOfDay": "NIGHT",
                    "weather": "RAIN" if "rain" in prompt_text.lower() else "CLEAR"
                }
            ],
            "scenes": [
                {
                    "sceneId": 1,
                    "duration": duration,
                    "camera": {"type": "PAN_RIGHT", "focalLength": 35},
                    "action": prompt_text
                }
            ]
        }

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='AuraDirector 3D Project Planner')
    parser.add_argument('--prompt', type=str, required=True, help='User prompt text')
    parser.add_argument('--duration', type=int, default=30, help='Duration in seconds')
    parser.add_argument('--output', type=str, default='project_plan.json', help='Output JSON filepath')
    args = parser.parse_args()

    director = AuraDirector()
    plan = director.parse_prompt_to_plan(args.prompt, args.duration)
    
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(plan, f, indent=2)
    print(f"[AuraDirector] Project plan successfully saved to {args.output}")
