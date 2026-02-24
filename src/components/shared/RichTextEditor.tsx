import { useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  Quote,
  Code2,
  Minus,
  X,
} from 'lucide-react'
import type React from 'react'
import ImageUploader from '@/components/shared/ImageUploader'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  imageStoragePath?: string
}

function ToolbarButton({
  onClick,
  isActive,
  icon: Icon,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  icon: React.ElementType
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-white text-navy shadow-sm'
          : 'text-gray-500 hover:text-navy hover:bg-white/50'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  imageStoragePath,
}: RichTextEditorProps) {
  const [showImagePopover, setShowImagePopover] = useState(false)
  const imageButtonRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || '请输入内容...',
      }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  if (!editor) return null

  const handleLinkClick = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = window.prompt('请输入链接地址')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-gray-100 rounded-t-lg border border-gray-200 overflow-x-auto">
      <div className="flex gap-1 p-2 min-w-max items-center">
        {/* Bold, Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          title="加粗"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          title="斜体"
        />

        <ToolbarSeparator />

        {/* H2, H3 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="二级标题"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          title="三级标题"
        />

        <ToolbarSeparator />

        {/* Bullet List, Ordered List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="无序列表"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="有序列表"
        />

        <ToolbarSeparator />

        {/* Link, Image */}
        <ToolbarButton
          onClick={handleLinkClick}
          isActive={editor.isActive('link')}
          icon={Link2}
          title="链接"
        />
        <div ref={imageButtonRef} className="relative">
          <ToolbarButton
            onClick={() => setShowImagePopover(!showImagePopover)}
            icon={ImageIcon}
            title="插入图片"
          />
        </div>

        <ToolbarSeparator />

        {/* Blockquote, Code Block, HR */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          title="引用"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={Code2}
          title="代码块"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          title="分隔线"
        />
      </div>
      </div>

      {/* Image popover */}
      {showImagePopover && (
        <div className="relative">
          <div className="absolute top-0 left-0 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-navy">插入图片</span>
              <button
                type="button"
                onClick={() => setShowImagePopover(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ImageUploader
              value=""
              onChange={(url) => {
                editor
                  .chain()
                  .focus()
                  .setImage({ src: url as string })
                  .run()
                setShowImagePopover(false)
              }}
              storagePath={imageStoragePath || 'editor'}
            />
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="border border-gray-200 border-t-0 rounded-b-lg min-h-[300px] p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
