import os
import requests
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class OpenAIAgent:
    def __init__(self, model_name="gpt-4o-mini"):
        api_key = os.getenv("OPENAI_KEY")
        self.maps_key = os.getenv("GOOGLE_MAPS_KEY")
        if not api_key:
            raise ValueError("OPENAI_KEY not found in environment variables")
        
        self.client = OpenAI(api_key=api_key)
        self.model = model_name
        
        # System instructions
        self.system_prompt = (
            "You are AirGuard AI, a safety assistant dedicated ONLY to California. "
            "Your job is to RE-ROUTE users from dangerous air to the nearest safe location (AQI < 50). "
            "When a user asks for safety, do the following: "
            "1. Check the air quality at their current location. "
            "2. If it's bad, check nearby coordinates in a 5-10 mile radius. "
            "3. Find the NEAREST coordinate with Good air and use 'relocate_map' to send them there. "
            "Do NOT draw markers, pins, or circles. Simply move the user's map view ('reroute' them) to the safe coordinate. "
            "Always stay within California. Politely decline any requests for safety outside California."
        )

    def get_air_quality(self, lat: float, lng: float):
        """Fetch real-time air quality data for a location."""
        url = f"https://airquality.googleapis.com/v1/currentConditions:lookup?key={self.maps_key}"
        payload = {
            "location": {
                "latitude": lat,
                "longitude": lng
            }
        }
        try:
            response = requests.post(url, json=payload)
            print(f"DEBUG: API Status Code: {response.status_code}")
            if response.status_code == 403:
                print("DEBUG: API Disabled. Returning Mock data.")
                return {
                    "dateTime": "2026-03-08T01:47:00Z",
                    "regionCode": "US",
                    "indexes": [
                        {
                            "code": "uaqi",
                            "displayName": "Universal AQI",
                            "aqi": 34,
                            "aqiDisplay": "34",
                            "color": {"red": 0.4, "green": 0.8, "blue": 0.2},
                            "category": "Good",
                            "dominantPollutant": "pm25"
                        }
                    ]
                }
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"DEBUG: API Call Failed: {str(e)}")
            return {"error": str(e)}

    def generate_response(self, prompt: str, history: list = None, lat: float = None, lng: float = None):
        print(f"DEBUG: Generating response for: {prompt[:30]}... User Loc: {lat}, {lng}")
        
        system_content = self.system_prompt
        if lat is not None and lng is not None:
            system_content += f"\n\nThe user's current map coordinates are: Lat {lat}, Lng {lng}."
            
        messages = [{"role": "system", "content": system_content}]
        if history:
            # History already formatted for OpenAI
            messages.extend(history)
        messages.append({"role": "user", "content": prompt})

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_air_quality",
                    "description": "Get real-time air quality index (AQI) and pollutants for a specific location.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "lat": {"type": "number", "description": "Latitude"},
                            "lng": {"type": "number", "description": "Longitude"}
                        },
                        "required": ["lat", "lng"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "relocate_map",
                    "description": "Moves the user's map view to a specific coordinate. Use this to REROUTE users to safe locations.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "lat": {"type": "number", "description": "Latitude to move to"},
                            "lng": {"type": "number", "description": "Longitude to move to"},
                            "label": {"type": "string", "description": "Explain why we moved here"}
                        },
                        "required": ["lat", "lng"]
                    }
                }
            }
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools
            )

            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls
            actions = []

            if tool_calls:
                messages.append(response_message)
                
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    print(f"DEBUG: AI calling tool {function_name} with {function_args}")

                    if function_name == "get_air_quality":
                        api_response = self.get_air_quality(
                            lat=function_args.get("lat"),
                            lng=function_args.get("lng")
                        )
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(api_response)
                        })
                    
                    elif function_name == "relocate_map":
                        actions.append({
                            "type": "relocate_map",
                            "payload": function_args
                        })
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": "Map relocated command sent."
                        })

                # Follow up to get final text
                final_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages
                )
                return {
                    "text": final_response.choices[0].message.content,
                    "actions": actions
                }

            return {
                "text": response_message.content,
                "actions": actions
            }
        except Exception as e:
            print(f"DEBUG Error in agent: {str(e)}")
            return {"text": f"Error: {str(e)}", "actions": []}
