import dynamic from "next/dynamic";

type ChatInputPayload = {
  text: string;
  lexical: string;
};

interface ChatInputProps {
  onSend: (payload: ChatInputPayload) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const Editor = dynamic(() => import("./editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-[72px] bg-muted animate-pulse rounded-md" />,
});

export const ChatInput = ({
  onSend,
  disabled,
  placeholder,
  maxLength,
}: ChatInputProps) => {
  return (
    <div className="px-5 w-full">
      <Editor
        onSend={onSend}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
};
