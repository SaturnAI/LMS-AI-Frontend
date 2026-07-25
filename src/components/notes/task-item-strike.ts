/**
 * Keeps the `strike` mark in sync with each taskItem's `checked` attribute.
 *
 * A CSS `text-decoration: line-through` keyed off `data-checked` looks like the
 * obvious fix, but per the CSS Text Decoration spec a decoration's position/
 * thickness is computed from the font metrics of whichever element *declares*
 * it. Declaring it only on the ancestor <p> mispositions the line against any
 * larger nested font-size span; declaring it on the <p> *and* its descendants
 * makes both paint their own decorating box — two overlapping lines. Applying
 * `strike` as a real mark sidesteps this: ProseMirror renders it on the actual
 * text run (merged with whatever other marks — bold, font-size — already wrap
 * that run), so there's exactly one decorating box, sized to the real glyphs.
 */
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const TaskItemStrike = Extension.create({
  name: "taskItemStrike",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("taskItemStrike"),
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const strikeType = newState.schema.marks.strike;
          if (!strikeType) return null;

          let tr = newState.tr;
          let changed = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== "taskItem") return;

            const checked = node.attrs.checked === true;
            const from = pos + 1;
            const to = pos + node.nodeSize - 1;
            if (to <= from) return;

            let hasText = false;
            let fullyMarked = true;
            let anyMarked = false;
            newState.doc.nodesBetween(from, to, (child) => {
              if (!child.isText) return;
              hasText = true;
              if (strikeType.isInSet(child.marks)) anyMarked = true;
              else fullyMarked = false;
            });
            if (!hasText) return;

            if (checked && !fullyMarked) {
              tr = tr.addMark(from, to, strikeType.create());
              changed = true;
            } else if (!checked && anyMarked) {
              tr = tr.removeMark(from, to, strikeType);
              changed = true;
            }
          });

          return changed ? tr : null;
        },
      }),
    ];
  },
});
