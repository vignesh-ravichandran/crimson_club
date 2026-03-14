# Input — raw files for task consumption

Drop **raw files** here when you need to give the AI (or any task) **file-based input** — not just a prompt. Use this folder when the task needs to read, organize, or use your files.

---

## Purpose

- **File-based input** — Screenshots, specs, exports, CSV/JSON, PDFs, design exports, or any file you want the AI to read and use for a task.
- **Organize or process** — You can ask to have files here organized, summarized, or turned into docs/plans/code. Output goes to `docs/`, `plans/`, or code; this folder stays the **input** side.
- **Single place for “stuff I’m feeding in”** — So Cursor (or other tools) know where to look when you say “use the files I added” or “organize what’s in input”.

---

## How to use

1. Put files in `input/` (or in subfolders like `input/screenshots/`, `input/specs/` if you like).
2. In your prompt, refer to them (e.g. “use the specs in `input/`”, “turn everything in `input/` into a product doc”).
3. After the task, move or delete files here if you don’t need them anymore. Processed content should live in `docs/`, `plans/`, or the codebase — not as the source of truth here.

---

## Optional: don’t commit input files

If you prefer **not** to commit the contents of this folder (e.g. temporary or sensitive raw files), add this to `.gitignore`:

```gitignore
# Ignore input contents but keep this README
input/*
!input/README.md
```

If you **do** want to commit reference inputs (e.g. sample payloads, specs that the team shares), leave `input/` unignored and commit as needed.

---

_Last updated: 2025-03-14_
