import { APPWRITE_ENDPOINT, IMAGES_BUCKET_ID, PROJECT_ID } from "@/src/config";

export const getAppwriteFileViewUrl = (fileId: string) => {
  const endpoint = APPWRITE_ENDPOINT;
  const project = PROJECT_ID;
  const bucket = IMAGES_BUCKET_ID;

  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${project}`;
};
