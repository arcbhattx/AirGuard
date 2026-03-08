import os
import requests
import json
from datetime import datetime
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
            "You are an intelligent Health Risk Triage Assistant. Your primary goal is to help users assess their personal health risk based on their current environmental conditions (specifically air quality) and their personal medical background.\n\n"
            "**EMERGENCY / DISTRESS OVERRIDE (CRITICAL):** If the user's input indicates severe distress, panic, or an immediate emergency (e.g., \"THERE IS SMOKE EVERYWHERE HELP WHERE DO I GO\"), you MUST bypass the standard triage process. DO NOT ask for their age or respiratory history. Instead:\n"
            "1. Call `find_nearby_safe_places` with the user's current coordinates.\n"
            "2. From the results, select ONLY the 3 CLOSEST locations. For EACH, clearly state its name and whether it is currently OPEN or CLOSED (use the `opening_hours` or `open_now` field and the current time). If hours are not available, state 'Hours unknown'.\n"
            "3. Do NOT list more than 3 locations. Only the 3 nearest.\n"
            "4. Recommend the BEST currently OPEN location among those 3 and call `route_to_safe_area` with that location's coordinates.\n"
            "5. Your text response MUST list exactly 3 locations with their open/closed status, clearly indicate which one you are routing to, and confirm the map route has been created.\n\n"
            "**CRITICAL DIRECTIVE:** You must NEVER calculate risk levels, diagnose conditions, or invent medical advice yourself. You MUST rely entirely on the external expert Machine Learning pipeline provided to you via the `assess_health_risk` tool.\n\n"
            "## Tool Availability\n"
            "You have access to a predictive triage model via the `assess_health_risk` tool.\n"
            "Before you can call this tool, you must gather the following four parameters:\n"
            "1. `aqi_24h` (number, 0-1000): The 24-hour average Air Quality Index in the user's area.\n"
            "2. `distance_to_clean_air_center` (number): Distance to the nearest clean air center in miles.\n"
            "3. `age` (integer, >= 0): The user's age.\n"
            "4. `respiratory_history` (boolean): Whether the user has a history of respiratory issues (e.g., asthma, COPD).\n\n"
            "### Information Gathering Strategy\n"
            "- If you do not have the user's `age` or `respiratory_history`, politely ask them for this information in a conversational manner.\n"
            "- If you do not have the local `aqi_24h` or `distance_to_clean_air_center`, use your location and environmental tools to determine these values based on the user's location. Do not ask the user if you can fetch it yourself.\n\n"
            "## Execution Flow\n"
            "1. **Analyze Context:** Review the conversation to see if you have all 4 required parameters.\n"
            "2. **Call the Model:** Once you have the parameters, immediately trigger the `assess_health_risk` tool. Do not guess the outcome.\n"
            "3. **Interpret and Respond:** When the tool returns its payload, you will receive a structured response containing: `risk_level`, `risk_probability`, `top_factors`, and `recommended_action`.\n"
            "Construct your response to the user strictly based on the data returned by the tool:\n"
            "- Emphasize their calculated `risk_level` (e.g., bold it).\n"
            "- Explain *why* they are at risk by incorporating the `top_factors` naturally into your sentence.\n"
            "- Provide the exact `recommended_action` (e.g., standard_observation, seek_clean_air_shelter, urgent_care). Do not alter the severity.\n\n"
            "Additionally, you STILL have the ability to re-route users via the `relocate_map` tool if they need to be moved to safety. Find a safe coordinate (AQI < 50) and use it."
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

    def find_nearby_safe_places(self, lat: float, lng: float):
        """Fetch nearby places that act as clean air centers (libraries, community centers, etc.)."""
        # Places API (New) requires a specific field mask header
        url = "https://places.googleapis.com/v1/places:searchNearby"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.maps_key,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.currentOpeningHours,places.regularOpeningHours"
        }
        payload = {
            "includedTypes": ["library", "community_center", "shopping_mall", "hospital", "school"],
            "maxResultCount": 10,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lng
                    },
                    "radius": 5000.0 # 5km
                }
            }
        }
        try:
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code == 403:
                print("DEBUG: Places API Disabled. Using Overpass API fallback.")
                import urllib.parse
                
                # Progressive search: try increasingly wider radii if not enough results
                amenities = "library|hospital|clinic|community_centre|fire_station|police|place_of_worship|pharmacy|social_facility|shelter"
                results = []
                for radius in [5000, 10000, 15000]:
                    overpass_query = f'[out:json];node(around:{radius},{lat},{lng})["amenity"~"{amenities}"];out 20;'
                    try:
                        op_resp = requests.get(f'http://overpass-api.de/api/interpreter?data={urllib.parse.quote(overpass_query)}')
                        op_resp.raise_for_status()
                        op_data = op_resp.json()
                        seen_names = set()
                        results = []
                        for el in op_data.get('elements', []):
                            tags = el.get('tags', {})
                            name = tags.get('name')
                            if not name or name in seen_names:
                                continue  # Skip unnamed or duplicate locations
                            seen_names.add(name)
                            place_info = {
                                "name": name,
                                "address": f"{el.get('lat')}, {el.get('lon')} (approx)",
                                "lat": el.get('lat'),
                                "lng": el.get('lon'),
                                "type": tags.get('amenity', 'unknown')
                            }
                            opening_hours = tags.get('opening_hours')
                            if opening_hours:
                                place_info["opening_hours"] = opening_hours
                            else:
                                place_info["opening_hours"] = "Not available"
                            results.append(place_info)
                        if len(results) >= 3:
                            break  # We have enough
                    except Exception as op_err:
                        print(f"DEBUG: Overpass API Call Failed at radius {radius}: {str(op_err)}")
                
                if results:
                    return {"places": results[:10]}
                # absolute fallback if overpass also fails or returns nothing
                return {
                    "places": [
                        {
                            "name": "Local Community Safe Center",
                            "address": "100 Relief Way",
                            "lat": lat + 0.01,
                            "lng": lng - 0.02,
                            "opening_hours": "24/7"
                        },
                        {
                            "name": "Emergency Fire Station",
                            "address": "200 Safety Blvd",
                            "lat": lat - 0.008,
                            "lng": lng + 0.01,
                            "opening_hours": "24/7"
                        },
                        {
                            "name": "County Medical Center",
                            "address": "300 Health Ave",
                            "lat": lat + 0.005,
                            "lng": lng + 0.015,
                            "opening_hours": "24/7"
                        }
                    ]
                }
            response.raise_for_status()
            data = response.json()
            places = data.get("places", [])
            results = []
            for p in places:
                place_info = {
                    "name": p.get("displayName", {}).get("text", "Unknown Place"),
                    "address": p.get("formattedAddress", ""),
                    "lat": p.get("location", {}).get("latitude"),
                    "lng": p.get("location", {}).get("longitude")
                }
                # Extract opening hours info
                current_hours = p.get("currentOpeningHours", {})
                if current_hours:
                    place_info["open_now"] = current_hours.get("openNow", None)
                    weekday_desc = current_hours.get("weekdayDescriptions", [])
                    if weekday_desc:
                        place_info["hours"] = "; ".join(weekday_desc)
                else:
                    place_info["open_now"] = None
                    place_info["hours"] = "Hours not available"
                results.append(place_info)
            return {"places": results}
        except Exception as e:
            print(f"DEBUG: Places API Call Failed: {str(e)}")
            return {"error": str(e)}

    def generate_response(self, prompt: str, history: list = None, lat: float = None, lng: float = None):
        print(f"DEBUG: Generating response for: {prompt[:30]}... User Loc: {lat}, {lng}")
        
        system_content = self.system_prompt
        
        # Inject current time context
        now = datetime.now()
        system_content += (
            f"\n\n**CURRENT TIME CONTEXT:** The current date and time is {now.strftime('%A, %B %d, %Y at %I:%M %p')} (local time). "
            f"Use this to evaluate whether locations are currently open when presenting safe places to users."
        )
        
        system_content += (
            "\n\n**LOCATION PRESENTATION RULES:** When presenting safe locations to the user, you MUST:\n"
            "1. Present EXACTLY 3 location options. Never present fewer or more than 3.\n"
            "2. Choose the 3 CLOSEST locations from the tool results.\n"
            "3. For each location, clearly state whether it is currently OPEN or CLOSED based on the opening_hours/open_now data and the current time.\n"
            "4. Prioritize locations that are currently open. List open locations first.\n"
            "5. If a location is closed, still include it but clearly mark it as closed and mention when it opens next if known.\n"
            "6. For the recommended route (the one you call route_to_safe_area for), always choose the BEST location that is currently OPEN.\n"
            "7. Format each location clearly with its name, open/closed status, and hours if available."
        )
        
        if lat is not None and lng is not None:
            system_content += (
                f"\n\nCRITICAL: The user's CURRENT active coordinates are EXACTLY Lat {lat}, Lng {lng}. "
                f"You MUST use these exact coordinates as the origin for all spatial tool calls "
                f"(e.g., finding safe places, air quality). Do NOT reuse old locations from conversation history, "
                f"as the user may have moved or changed their pinned location since the last message."
            )
            
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
            },
            {
                "type": "function",
                "function": {
                    "name": "assess_health_risk",
                    "description": "Calls the external strict ML service to determine clinical risk and actions based on user profile and environment.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "aqi_24h": {"type": "number", "description": "24-hour average Air Quality Index"},
                            "respiratory_history": {"type": "boolean", "description": "Whether the user has a history of respiratory issues"},
                            "distance_to_clean_air_center": {"type": "number", "description": "Distance to nearest shelter in miles"},
                            "age": {"type": "integer", "description": "User's age"}
                        },
                        "required": ["aqi_24h", "respiratory_history", "distance_to_clean_air_center", "age"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "route_to_safe_area",
                    "description": "Calculates and plots a direct route to the nearest safe area. Highly recommended for users in extreme distress.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "lat": {"type": "number", "description": "Safe Area Latitude"},
                            "lng": {"type": "number", "description": "Safe Area Longitude"},
                            "label": {"type": "string", "description": "Label for the safe area"}
                        },
                        "required": ["lat", "lng"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "find_nearby_safe_places",
                    "description": "Searches the Google Places API for nearby real-world locations that can serve as safe areas (like libraries, community centers, malls).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "lat": {"type": "number", "description": "User Latitude"},
                            "lng": {"type": "number", "description": "User Longitude"}
                        },
                        "required": ["lat", "lng"]
                    }
                }
            }
        ]

        try:
            actions = []
            
            while True:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=tools
                )

                response_message = response.choices[0].message
                tool_calls = response_message.tool_calls
                
                if not tool_calls:
                    # Final text response
                    return {
                        "text": response_message.content,
                        "actions": actions
                    }

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
                        
                    elif function_name == "find_nearby_safe_places":
                        api_response = self.find_nearby_safe_places(
                            lat=function_args.get("lat"),
                            lng=function_args.get("lng")
                        )
                        # Emit all locations to the frontend for markers + routes
                        if "places" in api_response:
                            actions.append({
                                "type": "set_all_safe_locations",
                                "payload": {
                                    "origin_lat": function_args.get("lat"),
                                    "origin_lng": function_args.get("lng"),
                                    "locations": api_response["places"]
                                }
                            })
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
                        
                    elif function_name == "route_to_safe_area":
                        actions.append({
                            "type": "route_to_safe_area",
                            "payload": {"lat": function_args.get("lat"), "lng": function_args.get("lng")}
                        })
                        # Also add a safe zone action to explicitly draw the bubble
                        actions.append({
                            "type": "set_safe_zones",
                            "payload": {
                                "zones": [
                                    {
                                        "lat": function_args.get("lat"),
                                        "lng": function_args.get("lng"),
                                        "label": function_args.get("label", "Safe Area"),
                                        "aqi": 20
                                    }
                                ]
                            }
                        })
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": "Routing requested via Map UI."
                        })
                        
                    elif function_name == "assess_health_risk":
                        # Glue logic: Call the standalone ML service
                        try:
                            ml_url = "http://localhost:8001/predict"
                            ml_payload = {
                                "aqi_24h": function_args.get("aqi_24h"),
                                "respiratory_history": function_args.get("respiratory_history"),
                                "distance_to_clean_air_center": function_args.get("distance_to_clean_air_center"),
                                "age": function_args.get("age")
                            }
                            ml_resp = requests.post(ml_url, json=ml_payload)
                            ml_resp.raise_for_status()
                            ml_predictions = ml_resp.json()
                            messages.append({
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": function_name,
                                "content": json.dumps(ml_predictions)
                            })
                        except Exception as ml_err:
                            print(f"DEBUG: ML Service failed: {str(ml_err)}")
                            messages.append({
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": function_name,
                                "content": f"ML Service Unavailable: {str(ml_err)}"
                            })
                            
        except Exception as e:
            print(f"DEBUG Error in agent: {str(e)}")
            return {"text": f"Error: {str(e)}", "actions": []}
