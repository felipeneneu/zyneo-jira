"use client";

import "./lexical-edit.css";
import {
  useCallback,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type EditorState,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  ListItemNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode, TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";

import { Button } from "@/src/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/ui/popover";
import { cn } from "@/src/lib/utils";

type ChatInputPayload = {
  text: string;
  lexical: string;
};

type EditorProps = {
  onSend: (payload: ChatInputPayload) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
};

const EMOJIS = [
  "\u{1F642}",
  "\u{1F600}",
  "\u{1F602}",
  "\u{1F60D}",
  "\u{1F60E}",
  "\u{1F621}",
  "\u{1F622}",
  "\u{1F44D}",
  "\u{1F44E}",
  "\u{1F389}",
  "\u{1F525}",
  "\u{1F680}",
  "\u{2705}",
  "\u{1F4A1}",
  "\u{1F4AC}",
  "\u{1F4AF}",
];

const theme = {
  paragraph: "chat-editor-paragraph",
  heading: {
    h1: "chat-editor-heading-h1",
    h2: "chat-editor-heading-h2",
    h3: "chat-editor-heading-h3",
  },
  list: {
    ol: "chat-editor-list-ol",
    ul: "chat-editor-list-ul",
    listitem: "chat-editor-listitem",
    nested: {
      listitem: "chat-editor-nested-listitem",
    },
  },
  quote: "chat-editor-quote",
  text: {
    bold: "chat-editor-text-bold",
    italic: "chat-editor-text-italic",
    underline: "chat-editor-text-underline",
    strikethrough: "chat-editor-text-strikethrough",
    code: "chat-editor-text-code",
    subscript: "chat-editor-text-subscript",
    superscript: "chat-editor-text-superscript",
  },
  code: "chat-editor-code",
  link: "chat-editor-link",
};

const editorConfig = {
  namespace: "workspace-chat",
  theme,
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    LinkNode,
  ],
  onError(error: Error) {
    throw error;
  },
};

const ToolbarButton = ({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
}) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
        active && "border-border bg-muted text-foreground",
        className
      )}
      {...props}
    />
  );
};

const ToolbarPlugin = ({ disabled }: { disabled?: boolean }) => {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsStrikethrough(selection.hasFormat("strikethrough"));
    setIsCode(selection.hasFormat("code"));

    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
    const listNode = $getNearestNodeOfType(anchorNode, ListNode);
    if (listNode) {
      setBlockType(listNode.getListType());
    } else {
      setBlockType(element.getType());
    }

    const node = selection.anchor.getNode();
    const parent = node.getParent();
    setIsLink($isLinkNode(node) || (parent ? $isLinkNode(parent) : false));
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    const url = window.prompt("Enter a URL");
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  }, [editor, isLink]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(emoji);
        }
      });
      editor.focus();
    },
    [editor]
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1">
      <ToolbarButton
        title="Undo"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={disabled || !canUndo}
      >
        Undo
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={disabled || !canRedo}
      >
        Redo
      </ToolbarButton>
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        title="Bold"
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        disabled={disabled}
      >
        B
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        disabled={disabled}
      >
        I
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        disabled={disabled}
      >
        U
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={isStrikethrough}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        disabled={disabled}
      >
        S
      </ToolbarButton>
      <ToolbarButton
        title="Inline code"
        active={isCode}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        disabled={disabled}
      >
        {"</>"}
      </ToolbarButton>
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        title="Bulleted list"
        active={blockType === "bullet"}
        onClick={() => {
          if (blockType === "bullet") {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
          } else {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          }
        }}
        disabled={disabled}
      >
        * List
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={blockType === "number"}
        onClick={() => {
          if (blockType === "number") {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
          } else {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          }
        }}
        disabled={disabled}
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        active={blockType === "quote"}
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const quoteNode = new QuoteNode();
              selection.insertNodes([quoteNode]);
            }
          });
        }}
        disabled={disabled}
      >
        Quote
      </ToolbarButton>
      <ToolbarButton
        title="Code block"
        active={blockType === "code"}
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const codeNode = new CodeNode();
              selection.insertNodes([codeNode]);
            }
          });
        }}
        disabled={disabled}
      >
        Code
      </ToolbarButton>
      <ToolbarButton
        title="Link"
        active={isLink}
        onClick={insertLink}
        disabled={disabled}
      >
        Link
      </ToolbarButton>
      <Popover>
        <PopoverTrigger asChild>
          <ToolbarButton title="Emoji" disabled={disabled}>
            :)
          </ToolbarButton>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2">
          <div className="grid grid-cols-6 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="flex h-8 items-center justify-center rounded-md text-lg hover:bg-muted"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const EditorShell = ({
  onSend,
  disabled,
  placeholder,
  maxLength,
}: EditorProps) => {
  const [editor] = useLexicalComposerContext();
  const [text, setText] = useState("");
  const [lexical, setLexical] = useState("");
  const [length, setLength] = useState(0);

  const canSend =
    !disabled &&
    text.trim().length > 0 &&
    (typeof maxLength === "undefined" || length <= maxLength);

  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const nextText = $getRoot().getTextContent();
      setText(nextText);
      setLength(nextText.length);
    });
    setLexical(JSON.stringify(editorState.toJSON()));
  }, []);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend({ text: text.trim(), lexical });
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    setText("");
    setLength(0);
    setLexical("");
    editor.focus();
  }, [canSend, editor, lexical, onSend, text]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div className="rounded-lg border bg-background shadow-xs">
      <ToolbarPlugin disabled={disabled} />
      <div className="chat-editor-wrapper">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="chat-editor-input"
              onKeyDown={handleKeyDown}
            />
          }
          placeholder={
            <div className="chat-editor-placeholder">
              {placeholder ?? "Type a message..."}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={handleChange} />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <AutoFocusPlugin />
      </div>
      <div className="flex items-center justify-between border-t px-2 py-1">
        {typeof maxLength === "number" ? (
          <div
            className={cn(
              "text-xs",
              length > maxLength ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {length}/{maxLength}
          </div>
        ) : (
          <div />
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSend}
          disabled={!canSend}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export const Editor = (props: EditorProps) => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <EditorShell {...props} />
    </LexicalComposer>
  );
};
