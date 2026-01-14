import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback } from "@/src/ui/avatar";

interface MembersAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const MembersAvatar = ({
  name,
  className,
  fallbackClassName,
}: MembersAvatarProps) => {
  return (
    <Avatar
      className={cn(
        "size-5 transition border border-neutral-300 rounded-full",
        className
      )}
    >
      <AvatarFallback
        className={cn(
          "bg-neutral-200 flex items-center justify-center",
          fallbackClassName
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
