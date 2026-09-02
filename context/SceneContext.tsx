"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type RoomId = "gallery" | "studio" | "about" | "contact" | null;

type SceneContextType = {
  hasEntered: boolean;
  markEntered: () => void;
  currentRoom: RoomId;
  isInRoom: boolean;
  isTeleporting: boolean;
  enterRoom: (id: RoomId) => void;
  exitRoom: () => void;
  setTeleporting: (v: boolean) => void;
  pendingDoorClick: RoomId;
  setPendingDoorClick: (v: RoomId) => void;
  deeplinkHandled: React.MutableRefObject<boolean>;
  initialRoom: RoomId;
  teleportTo: (id: RoomId) => void;
};

const SceneContext = createContext<SceneContextType | null>(null);

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomId>(null);
  const [isTeleporting, setTeleporting] = useState(false);
  const [pendingDoorClick, setPendingDoorClick] = useState<RoomId>(null);
  const deeplinkHandled = useRef(false);
  // Could parse ?room= query but keep null for now
  const initialRoom: RoomId = null;

  const markEntered = useCallback(() => setHasEntered(true), []);
  const enterRoom = useCallback((id: RoomId) => {
    if (!id) return;
    setPendingDoorClick(id);
    setTeleporting(true);
    // small delay to allow door anim before switching
    setTimeout(() => {
      setCurrentRoom(id);
      setTeleporting(false);
    }, 900);
  }, []);
  const exitRoom = useCallback(() => {
    setTeleporting(true);
    setTimeout(() => {
      setCurrentRoom(null);
      setPendingDoorClick(null);
      setTeleporting(false);
    }, 600);
  }, []);
  const teleportTo = useCallback((id: RoomId) => {
    setCurrentRoom(id);
  }, []);

  return (
    <SceneContext.Provider
      value={{
        hasEntered,
        markEntered,
        currentRoom,
        isInRoom: currentRoom !== null,
        isTeleporting,
        enterRoom,
        exitRoom,
        setTeleporting,
        pendingDoorClick,
        setPendingDoorClick,
        deeplinkHandled,
        initialRoom,
        teleportTo,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene must be inside SceneProvider");
  return ctx;
}
