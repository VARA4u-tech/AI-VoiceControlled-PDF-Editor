import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  isLoading?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-primary/20 bg-background/50 p-2 backdrop-blur-md">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('bold') ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('italic') ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('strike') ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-[1px] bg-primary/20" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-[1px] bg-primary/20" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('bulletList') ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('orderedList') ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded p-1.5 transition-colors ${editor.isActive('blockquote') ? 'bg-accent/20 text-accent' : 'text-primary/70 hover:bg-primary/10 hover:text-primary'}`}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <div className="mx-1 h-4 w-[1px] bg-primary/20" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="rounded p-1.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="rounded p-1.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, isLoading }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base prose-invert prose-p:my-2 prose-headings:mb-3 prose-headings:mt-6 prose-a:text-accent focus:outline-none max-w-none min-h-[400px] p-6 text-foreground/90 font-body',
      },
    },
  });

  // Sync external content changes into the editor if it changes from outside
  // (e.g. AI updates or loading a new document)
  if (editor && content !== editor.getHTML()) {
    // Only update if the content actually differs from what the editor has
    // to prevent cursor jumping while typing.
    const currentEditorContent = editor.getHTML();
    if (content !== currentEditorContent && content !== '<p></p>' && currentEditorContent !== '<p></p>') {
      // Small timeout prevents state update during render
      setTimeout(() => {
        editor.commands.setContent(content, { emitUpdate: false });
      }, 0);
    }
  }

  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border border-primary/30 bg-background/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500">
      <div className="tech-bracket-tl" />
      <div className="tech-bracket-tr" />
      <div className="tech-bracket-bl" />
      <div className="tech-bracket-br" />

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <div className="absolute inset-0 animate-pulse bg-accent/20 blur-xl" />
          </div>
          <p className="font-tech animate-pulse text-xs uppercase tracking-[0.4em] text-accent">
            Modulating Content...
          </p>
        </div>
      )}

      <MenuBar editor={editor} />
      
      <div className="custom-scrollbar max-h-[60vh] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
