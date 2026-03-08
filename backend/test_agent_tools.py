import os
from agents.openai_agent import OpenAIAgent

def test_agent():
    print("Initializing agent...")
    agent = OpenAIAgent()
    
    # Test case: User wants to move to a safe spot.
    print("Asking to move to a cleaner area...")
    result = agent.generate_response(
        "The air here is bad. Move the map to a cleaner spot nearby.",
        lat=37.3,
        lng=-120.48
    )
    
    print("\nAI Response:")
    print(result["text"])
    
    print("\nActions taken:")
    for action in result.get("actions", []):
        print(f"Action: {action['type']} -> {action['payload']}")

if __name__ == "__main__":
    test_agent()
