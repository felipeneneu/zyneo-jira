import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["report-overview"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["report-overview"]["$post"]
>;

export const useGenerateTasksReport = () =>
  useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["report-overview"]["$post"]({
        json,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        const message = payload.error ?? "Falha ao gerar overview.";
        throw new Error(message);
      }
      return await response.json();
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao gerar overview.");
    },
  });
