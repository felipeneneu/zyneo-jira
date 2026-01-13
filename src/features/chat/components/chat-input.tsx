import dynamic from "next/dynamic";

// import { Editaror } from "./editor";

const Editor = dynamic(() => import("./editor").then((mod) => mod.Editaror), {
  ssr: false,
  loading: () => <div className="h-[100px] bg-slate-200 animate-pulse" />, // Opcional: um esqueleto de loading
});

export const ChatInput = () => {
  return (
    <div className="px-5 w-full">
      <Editor />
    </div>
  );
};
