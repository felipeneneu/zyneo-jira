import { APPWRITE_ENDPOINT, IMAGES_BUCKET_ID, PROJECT_ID } from "@/src/config";
import { cn } from "@/src/lib/utils";

import { Avatar, AvatarFallback } from "@/src/ui/avatar";
import Image from "next/image";

interface WorkspaceAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

const getAppwriteFileViewUrl = (fileId: string) => {
  const endpoint = APPWRITE_ENDPOINT;
  const project = PROJECT_ID;
  const bucket = IMAGES_BUCKET_ID;

  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${project}`;
};

export const WorkspaceAvatar = ({
  image,
  name,
  className,
}: WorkspaceAvatarProps) => {
  if (image) {
    return (
      <div
        className={cn("size-10 relative rounded-md overflow-hidden", className)}
      >
        <Image
          src={getAppwriteFileViewUrl(image)}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <Avatar className={cn("size-10 rounded-md", className)}>
      <AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};
