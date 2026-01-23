import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";

interface MembersAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export const MembersAvatar = ({
  name,
  avatarUrl,
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
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
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
