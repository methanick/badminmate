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
      courtId?: number;
      team?: "team1" | "team2";
      slotIndex?: number;
    } | null,
  ) => void;
  removePlayerFromSlot: (
    courtId: number,
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

    if (!over) return;

    const draggedPlayer = active.data.current as Player;
    const sourceSlotId = String(active.id);
    const destId = String(over.id);

    // Handle trash zone
    if (destId === "trash-zone") {
      let fromCourt = false;
      let courtId: number | undefined;
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
      const parts = destId.split("-");
      if (parts.length === 4) {
        const targetCourtId = parseInt(parts[1]);
        const teamKey = parts[2] as "team1" | "team2";
        const slotIdx = parseInt(parts[3]);

        // Check if moving within same court
        const sourceCourtId = sourceSlotId.startsWith("player-in-court")
          ? parseInt(sourceSlotId.split("-")[3])
          : null;

        if (sourceCourtId === targetCourtId) {
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
          // Move from different court or player list
          if (sourceCourtId !== null) {
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
            // Remove from resting zone if present
            setRestingPlayers((prev) =>
              prev.filter((p) => p.id !== draggedPlayer.id),
            );
          }

          // Add to target court
          setCourts((prev) =>
            prev.map((court) => {
              if (court.id !== targetCourtId) return court;

              const newTeam = [...court[teamKey]] as [
                Player | null,
                Player | null,
              ];

              if (!newTeam[slotIdx]) {
                newTeam[slotIdx] = draggedPlayer;
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
