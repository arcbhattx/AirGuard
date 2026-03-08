"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Message } from "@/app/types/chat";
import { SAMPLE_MESSAGES } from "@/app/constants/chat";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

import { useMap } from "./MapContext";

export function useChat(user: User | null, initialConversations: any[]) {
  const { panTo, center, setSafeZones, setAQICircles, setDirectionsRoute, customLocation, setMultiRoutes, setSafeLocationMarkers, setSelectedRouteIndex } = useMap();
  const [conversations, setConversations] = useState<any[]>(initialConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const refreshConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      setConversations(data);
    }
  }, [supabase, user?.id]);

  // Load messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) {
        setMessages(SAMPLE_MESSAGES); // Show greeting for new, empty chat
        setShowQuickReplies(true);
        return;
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      if (data && data.length > 0) {
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          text: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
        setShowQuickReplies(false);
      } else {
        setMessages(SAMPLE_MESSAGES);
        setShowQuickReplies(true);
      }
    }

    loadMessages();
  }, [activeConversationId, supabase]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages(SAMPLE_MESSAGES); // Re-show greeting for fresh start
    setShowQuickReplies(true);
  }, []);

  // Helper function to fetch a single OSRM route
  const fetchOsrmRoute = async (originLat: number, originLng: number, destLat: number, destLng: number): Promise<google.maps.LatLngLiteral[] | null> => {
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=polyline`;
      const res = await fetch(osrmUrl);
      const data = await res.json();
      if (data.code === "Ok" && data.routes.length > 0) {
        const decoded = window.google.maps.geometry.encoding.decodePath(data.routes[0].geometry);
        return decoded.map((p: google.maps.LatLng) => ({ lat: p.lat(), lng: p.lng() }));
      }
    } catch (err) {
      console.warn("OSRM route fetch failed for a location:", err);
    }
    // Fallback: straight line
    return [
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng }
    ];
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let convId = activeConversationId;

    // Create new conversation if needed
    if (!convId && user) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: trimmed.slice(0, 30) + (trimmed.length > 30 ? "..." : "") })
        .select("*")
        .single();

      if (convError) {
        console.error("Error creating conversation:", convError);
        return;
      }

      if (newConv) {
        convId = newConv.id;
        setActiveConversationId(newConv.id);
        // Add to list
        setConversations(prev => [newConv, ...prev]);
      }
    }

    // Update UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setShowQuickReplies(false);

    // Save user message to database
    if (convId) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: trimmed,
      });
    }

    // Call backend for AI response
    try {
      // Use custom pin location if set
      let currentLat = customLocation?.lat || center.lat;
      let currentLng = customLocation?.lng || center.lng;
      
      // Only try physical geolocation if they haven't explicitly pinned a custom location
      if (!customLocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          currentLat = position.coords.latitude;
          currentLng = position.coords.longitude;
        } catch (geoErr) {
          console.warn("Could not get physical geolocation, using map center fallback:", geoErr);
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
          latitude: currentLat,
          longitude: currentLng,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const aiResponseText = data.response;
      const actions = data.actions || [];

      // Route colors for multi-route display
      const routeColors = ["#01BAEF", "#FF6B35", "#7BC950", "#9B59B6", "#E74C3C"];

      // Execute actions
      for (const action of actions) {
        if (action.type === "relocate_map") {
          panTo(action.payload.lat, action.payload.lng);
        } else if (action.type === "route_to_safe_area") {
          const lat = action.payload.lat;
          const lng = action.payload.lng;
          setDirectionsRoute({
            origin: { lat: currentLat, lng: currentLng },
            destination: { lat, lng }
          });
          panTo(lat, lng);
        } else if (action.type === "set_all_safe_locations") {
          const allLocations = action.payload.locations || [];
          const originLat = action.payload.origin_lat || currentLat;
          const originLng = action.payload.origin_lng || currentLng;

          // Calculate distance and sort by closest, take top 3
          const withDistance = allLocations.map((loc: any) => {
            const dLat = loc.lat - originLat;
            const dLng = loc.lng - originLng;
            return { ...loc, distance: Math.sqrt(dLat * dLat + dLng * dLng) };
          });
          withDistance.sort((a: any, b: any) => a.distance - b.distance);
          const locations = withDistance.slice(0, 3);

          // Set markers for the 3 closest locations
          const markers = locations.map((loc: any, idx: number) => ({
            lat: loc.lat,
            lng: loc.lng,
            label: loc.name || `Location ${idx + 1}`,
            isOpen: loc.open_now ?? null,
            isRecommended: idx === 0,
          }));
          setSafeLocationMarkers(markers);

          // Reset selection
          setSelectedRouteIndex(null);

          // Fetch OSRM routes for 3 closest locations in parallel
          const routePromises = locations.map((loc: any) =>
            fetchOsrmRoute(originLat, originLng, loc.lat, loc.lng)
          );
          const routePaths = await Promise.all(routePromises);
          
          const routes = routePaths
            .map((path, idx) => {
              if (!path) return null;
              return {
                path,
                color: routeColors[idx % routeColors.length],
                label: locations[idx].name || `Location ${idx + 1}`,
                isRecommended: idx === 0,
              };
            })
            .filter(Boolean) as any[];
          
          setMultiRoutes(routes);

          // Zoom to fit all 3 markers
          if (locations.length > 0) {
            panTo(locations[0].lat, locations[0].lng);
          }
        } else if (action.type === "set_safe_zones") {
          const formattedZones = action.payload.zones.map((z: any, idx: number) => ({
            id: `safe-${Date.now()}-${idx}`,
            lat: z.lat,
            lng: z.lng,
            label: z.label,
            aqi: z.aqi
          }));
          setSafeZones(formattedZones);
        } else if (action.type === "set_aqi_circles") {
          const formattedCircles = action.payload.circles.map((c: any, idx: number) => ({
            id: `circle-${Date.now()}-${idx}`,
            lat: c.lat,
            lng: c.lng,
            radius: c.radius,
            color: c.color,
            aqi: c.aqi
          }));
          setAQICircles(formattedCircles);
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: aiResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      // Save AI response to database
      if (convId) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: aiResponseText,
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);

      // Optional: Add error message to chat
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  }, [activeConversationId, messages, supabase, user?.id, center, customLocation, panTo, setSafeZones, setAQICircles, setDirectionsRoute, setMultiRoutes, setSafeLocationMarkers, setSelectedRouteIndex]);

  return {
    messages,
    conversations,
    isTyping,
    sendMessage,
    startNewChat,
    activeConversationId,
    setActiveConversationId,
    showQuickReplies,
    refreshConversations,
  };
}
