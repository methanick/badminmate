import { Card } from "@/components/ui/card";
import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

export function TrashZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash-zone",
  });

  return (
    <div ref={setNodeRef}>
      <Card
        className={`w-full max-w-full transition-colors ${
          isOver ? "bg-red-100 border-red-400 border-2" : ""
        }`}
      >
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <Trash2
            className={`w-10 h-10 transition-colors ${
              isOver ? "text-red-600" : "text-gray-400"
            }`}
          />
        </div>
      </Card>
    </div>
  );
}
