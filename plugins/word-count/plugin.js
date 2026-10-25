// OPEN PDF sample plugin: word/character/page counts for the active document.
// Runs sandboxed; `openpdf` is the permission-checked host API.
const info = await openpdf.getDocInfo();
if (!info) return "No document is open.";

openpdf.log("Counting " + info.pageCount + " page(s)...");
let words = 0;
let chars = 0;
for (let p = 0; p < info.pageCount; p++) {
  const text = await openpdf.getPageText(p);
  chars += text.length;
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  words += tokens.length;
}
return (
  "Document: " + info.title + "\n" +
  "Pages: " + info.pageCount + "\n" +
  "Words: " + words + "\n" +
  "Characters: " + chars
);
