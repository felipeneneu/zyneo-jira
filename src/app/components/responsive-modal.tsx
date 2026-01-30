import { useMedia } from "react-use"; // restored
import { Dialog, DialogContent } from "@/src/ui/dialog";

import { Drawer, DrawerContent } from "@/src/ui/drawer";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({
  children,
  open,
  onOpenChange,
}: ResponsiveModalProps) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);

  if (isDesktop) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="w-full sm:max-w-lg p-0 border-none max-h-[85vh] overflow-hidden">
          {children}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="w-full sm:max-w-lg max-h-[85vh] p-0 overflow-hidden">
        <div className="p-0 border-none">{children}</div>
      </DrawerContent>
    </Drawer>
  );
};
