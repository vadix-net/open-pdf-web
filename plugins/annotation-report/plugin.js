// OPEN PDF sample plugin: summarize review annotations by type and author.
const info = await openpdf.getDocInfo();
if (!info) return "No document is open.";

const annots = JSON.parse(await openpdf.getAnnotationsJson());
if (annots.length === 0) return "No annotations in " + info.title + ".";

const byType = {};
const byAuthor = {};
for (const a of annots) {
  byType[a.type] = (byType[a.type] || 0) + 1;
  byAuthor[a.author] = (byAuthor[a.author] || 0) + 1;
}
const fmt = (obj) =>
  Object.entries(obj)
    .sort((x, y) => y[1] - x[1])
    .map(([k, v]) => "  " + k + ": " + v)
    .join("\n");

return (
  "Annotation report for " + info.title + "\n" +
  "Total: " + annots.length + "\n\n" +
  "By type:\n" + fmt(byType) + "\n\n" +
  "By author:\n" + fmt(byAuthor)
);
