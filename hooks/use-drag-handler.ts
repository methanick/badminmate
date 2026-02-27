import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";
import { DragEndEvent } from "@dnd-kit/core";

interface UseDragHandlerParams {
  courts: Court[];
  setCourts: (value: Court[] | ((prev: Court[]) => Court[])) => void;
  setRestingPlayers: (value: Player[] | ((prev: Player[]) => Player[])) => void;
  setDeleteConfirmOpen: (value: boolean) => void;
  setPlayerToDelete: (
    value: {
      player: Player;
      fromCourt: boolean;
      courtId?: string;
      team?: "team1" | "team2";
      slotIndex?: number;
    } | null,
  ) => void;
  removePlayerFromSlot: (
    courtId: string,
    team: "team1" | "team2",
    slotIndex: number,
  ) => void;
}

export function useDragHandler({
  courts,
  setCourts,
  setRestingPlayers,
  setDeleteConfirmOpen,
  setPlayerToDelete,
  removePlayerFromSlot,
}: UseDragHandlerParams) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("🎯 Drag End Event:", { active, over });

    if (!over) {
      console.log("❌ No drop target");
      return;
    }

    const draggedPlayer = active.data.current as Player;
    const sourceSlotId = String(active.id);
    const destId = String(over.id);

    console.log("🔄 Drag Info:", {
      draggedPlayer,
      sourceSlotId,
      destId,
    });

    // Handle trash zone
    if (destId === "trash-zone") {
      let fromCourt = false;
      let courtId: string | undefined;
      let team: "team1" | "team2" | undefined;
      let slotIndex: number | undefined;

      courts.forEach((court) => {
        court.team1.forEach((p, idx) => {
          if (p?.id === draggedPlayer.id) {
            fromCourt = true;
            courtId = court.id;
            team = "team1";
            slotIndex = idx;
          }
        });
        court.team2.forEach((p, idx) => {
          if (p?.id === draggedPlayer.id) {
            fromCourt = true;
            courtId = court.id;
            team = "team2";
            slotIndex = idx;
          }
        });
      });

      setPlayerToDelete({
        player: draggedPlayer,
        fromCourt,
        courtId,
        team,
        slotIndex,
      });
      setDeleteConfirmOpen(true);
      return;
    }

    // Handle rest zone
    if (destId === "rest-zone") {
      setRestingPlayers((prev) => {
        const exists = prev.some((p) => p.id === draggedPlayer.id);
        if (exists) return prev;
        return [...prev, draggedPlayer];
      });

      courts.forEach((court) => {
        court.team1.forEach((p, idx) => {
          if (p?.id === draggedPlayer.id) {
            removePlayerFromSlot(court.id, "team1", idx);
          }
        });
        court.team2.forEach((p, idx) => {
          if (p?.id === draggedPlayer.id) {
            removePlayerFromSlot(court.id, "team2", idx);
          }
        });
      });
      return;
    }

    // Handle court slots
    if (destId.startsWith("court-")) {
      console.log("⚽ Dropping to court slot:", destId);

      const parts = destId.split("-");
      console.log("📦 Parts:", parts);

      if (parts.length === 4) {
        const targetCourtId = parts[1];
        const teamKey = parts[2] as "team1" | "team2";
        const slotIdx = parseInt(parts[3]);

        console.log("🎯 Target:", { targetCourtId, teamKey, slotIdx });

        // Check if moving within same court
        const sourceCourtId = sourceSlotId.startsWith("player-in-court")
          ? sourceSlotId.split("-")[3]
          : null;

        console.log("📍 Source court ID:", sourceCourtId);

        if (sourceCourtId === targetCourtId) {
          console.log("🔄 Moving within same court");
          // Move within same court
          setCourts((prev) =>
            prev.map((court) => {
              if (court.id !== targetCourtId) return court;

              const sourceTeamKey = sourceSlotId.includes("-team1-")
                ? "team1"
                : "team2";
              const sourceSlotIdx = parseInt(
                sourceSlotId.split("-").pop() || "0",
              );

              const newTeam1 = [...court.team1] as [
                Player | null,
                Player | null,
              ];
              const newTeam2 = [...court.team2] as [
                Player | null,
                Player | null,
              ];

              // Remove from source
              if (sourceTeamKey === "team1") {
                newTeam1[sourceSlotIdx] = null;
              } else {
                newTeam2[sourceSlotIdx] = null;
              }

              // Add to destination if slot is empty
              if (teamKey === "team1" && !newTeam1[slotIdx]) {
                newTeam1[slotIdx] = draggedPlayer;
              } else if (teamKey === "team2" && !newTeam2[slotIdx]) {
                newTeam2[slotIdx] = draggedPlayer;
              }

              return {
                ...court,
                team1: newTeam1,
                team2: newTeam2,
              };
            }),
          );
        } else {
          console.log("🔀 Moving from different location");
          // Move from different court or player list
          if (sourceCourtId !== null) {
            console.log("📤 Removing from source court:", sourceCourtId);
            setCourts((prev) =>
              prev.map((court) => {
                if (court.id !== sourceCourtId) return court;

                const sourceTeamKey = sourceSlotId.includes("-team1-")
                  ? "team1"
                  : "team2";
                const sourceSlotIdx = parseInt(
                  sourceSlotId.split("-").pop() || "0",
                );

                const newTeam = [...court[sourceTeamKey]] as [
                  Player | null,
                  Player | null,
                ];
                newTeam[sourceSlotIdx] = null;

                return {
                  ...court,
                  [sourceTeamKey]: newTeam,
                };
              }),
            );
          } else {
            console.log(
              "🎯 Player from outside court (player list or resting)",
            );
            // Remove from resting zone if present
            setRestingPlayers((prev) =>
              prev.filter((p) => p.id !== draggedPlayer.id),
            );
          }

          console.log("📥 Adding to target court:", targetCourtId);
          // Add to target court
          setCourts((prev) =>
            prev.map((court) => {
              if (court.id !== targetCourtId) return court;

              const newTeam = [...court[teamKey]] as [
                Player | null,
                Player | null,
              ];

              console.log("🔍 Current team state:", newTeam);
              console.log("🔍 Target slot index:", slotIdx);
              console.log("🔍 Is slot empty?:", !newTeam[slotIdx]);

              if (!newTeam[slotIdx]) {
                newTeam[slotIdx] = draggedPlayer;
                console.log("✅ Player added to slot!");
              } else {
                console.log("❌ Slot already occupied!");
              }

              return {
                ...court,
                [teamKey]: newTeam,
              };
            }),
          );
        }
      }
    }
  };

  return { handleDragEnd };
}
