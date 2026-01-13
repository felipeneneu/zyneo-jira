"use client";

import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.chat)["realtime-token"]["$get"],
  200
>;

type DataType = ResponseType["data"];

export const useChatRealtimeToken = (enabled = true) => {
  return useQuery<DataType>({
    queryKey: ["chat", "realtime-token"],
    enabled,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const response = await client.api.chat["realtime-token"].$get();
      if (!response.ok) {
        throw new Error("Failed to fetch realtime token");
      }
      const { data } = await response.json();
      return data;
    },
  });
};
