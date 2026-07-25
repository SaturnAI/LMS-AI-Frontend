/**
 * Generic file attachments (PDF, docs, anything that isn't an image — images
 * use the official `@tiptap/extension-image` instead). There's no backend
 * file storage yet, so the file is embedded as a base64 data URL right in the
 * note's content and rides along with everything else in localStorage — see
 * the size cap in NoteEditor's file-picker handler.
 */
import { Node, mergeAttributes } from "@tiptap/core";

export interface FileAttachmentAttrs {
  href: string;
  filename: string;
  mimeType: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export const FileAttachment = Node.create({
  name: "fileAttachment",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      href: { default: null },
      filename: { default: "file" },
      mimeType: { default: "" },
      size: { default: 0 },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-file-attachment]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { href, filename, size, mimeType } = node.attrs as FileAttachmentAttrs;
    const container = mergeAttributes(HTMLAttributes, {
      "data-file-attachment": "",
      class: "note-attachment-card",
    });
    const removeButton = [
      "button",
      { type: "button", "data-remove-attachment": "", "aria-label": "Remove attachment", class: "note-attachment-remove" },
      "×",
    ];
    const downloadLink = [
      "a",
      { href, download: filename, class: "note-file-attachment-link" },
      ["span", { class: "note-file-attachment-name" }, filename],
      ["span", { class: "note-file-attachment-size" }, formatBytes(size)],
    ];

    // Video and PDF both play/render natively from a data: URL in the
    // browser, same as <img src="data:...">, so show them inline instead of
    // making the user download to view — just like the Image extension does.
    // An <iframe> (not <embed>) is used for PDF — it consistently invokes the
    // browser's own full PDF viewer (scrolling, page nav, zoom), where <embed>
    // depends on plugin support that's inconsistent across browsers.
    if (mimeType.startsWith("video/")) {
      return [
        "div",
        container,
        removeButton,
        ["video", { src: href, controls: "true", class: "note-video-attachment" }],
      ];
    }
    if (mimeType === "application/pdf") {
      return [
        "div",
        container,
        removeButton,
        ["iframe", { src: href, class: "note-pdf-attachment" }],
        downloadLink,
      ];
    }

    return ["div", container, removeButton, downloadLink];
  },
});
