"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Player } from "@/model/player.model";

interface ConfirmationDialogsProps {
  deleteConfirm: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    playerToDelete: {
      player: Player;
      fromCourt: boolean;
    } | null;
  };
  deleteCourtConfirm: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
  };
  clearAllPlayersConfirm: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
  };
  resetGamesPlayedConfirm: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
  };
}

export function ConfirmationDialogs({
  deleteConfirm,
  deleteCourtConfirm,
  clearAllPlayersConfirm,
  resetGamesPlayedConfirm,
}: ConfirmationDialogsProps) {
  return (
    <>
      {/* Delete Player Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบผู้เล่น</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ{" "}
              <strong>{deleteConfirm.playerToDelete?.player.name}</strong>{" "}
              ออกจากระบบใช่หรือไม่?
              {deleteConfirm.playerToDelete?.fromCourt &&
                " (ผู้เล่นจะถูกลบออกจากสนามด้วย)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={deleteConfirm.onConfirm}>
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Court Confirmation Dialog */}
      <AlertDialog
        open={deleteCourtConfirm.open}
        onOpenChange={deleteCourtConfirm.onOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบสนาม</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบสนามนี้ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCourtConfirm.onConfirm}>
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Players Confirmation Dialog */}
      <AlertDialog
        open={clearAllPlayersConfirm.open}
        onOpenChange={clearAllPlayersConfirm.onOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบผู้เล่นทั้งหมด</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบผู้เล่นทั้งหมดออกจากระบบใช่หรือไม่?
              การกระทำนี้ไม่สามารถย้อนกลับได้ และผู้เล่นจะถูกลบออกจากทุกสนามด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearAllPlayersConfirm.onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบทั้งหมด
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Games Played Confirmation Dialog */}
      <AlertDialog
        open={resetGamesPlayedConfirm.open}
        onOpenChange={resetGamesPlayedConfirm.onOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการรีเซ็ตจำนวนเกม</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการรีเซ็ตจำนวนเกมที่เล่นของผู้เล่นทุกคนเป็น 0 ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetGamesPlayedConfirm.onConfirm}
              className="bg-orange-600 hover:bg-orange-700"
            >
              รีเซ็ต
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
