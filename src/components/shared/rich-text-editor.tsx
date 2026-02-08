"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none px-3 py-2 text-sm min-h-[120px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        "tiptap-editor rounded-md border shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
      )}
    >
      {/* Toolbar */}
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap items-center gap-0.5 border-b px-1 py-1 bg-background rounded-t-md">
          <ToolbarButton
            tooltip="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Bullet List"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Ordered List"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            tooltip="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo />
          </ToolbarButton>
        </div>
      </TooltipProvider>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-background rounded-b-md" />
    </div>
  );
}

function ToolbarButton({
  tooltip,
  active,
  disabled,
  onClick,
  children,
}: {
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
