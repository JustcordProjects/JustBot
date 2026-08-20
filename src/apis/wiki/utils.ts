// don't ask me how this works; made by ai (and polished by one)
export function doWikitext2markdown(rawText: string): string {
  let text = rawText;

  // 1. Remove recursive {{Templates}} like Infoboxes and Era tags
  // Uses a loop to handle nested brackets up to a reasonable depth
  while (text.includes("{{")) {
    const nextText = text.replace(/\{\{(?:[^{}]|\{[^{}]*\})*\}\}/gs, "");
    if (nextText === text) break;
    text = nextText;
  }

  // 2. Remove File/Image embeds entirely: [[File:name.jpg|options|caption]]
  text = text.replace(/\[\[File:[^\]\n]+\]\]\n?/g, "");

  // 3. Handle piped links: [[Actual Page|Displayed Text]] -> Displayed Text
  text = text.replace(/\[\[[^|\]\n]+\|([^\]\n]+)\]\]/g, "$1");

  // 4. Handle standard links: [[Page Name]] -> Page Name
  text = text.replace(/\[\[([^|\]\n]+)\]\]/g, "$1");

  // 5. Strip out HTML references (<ref>...</ref> or <ref />)
  text = text.replace(/<ref[^>]*>.*?<\/ref>/gs, "");
  text = text.replace(/<ref[^>]*\/>/g, "");

  // 6. Clean up blockquotes: <blockquote>''Text''</blockquote> -> > *Text*
  text = text.replace(/<blockquote>''([\s\S]*?)''<\/blockquote>/g, "> *$1*");

  // 7. Convert MediaWiki bold/italics to standard Markdown (Bold first!)
  text = text.replace(/'''([\s\S]*?)'''/g, "**$1**"); // Bold
  text = text.replace(/''([\s\S]*?)''/g, "*$1*"); // Italics

  // 8. Convert MediaWiki headings: == title == -> nothing
  // Handles variable spaces around the title text safely
  text = text.replace(/^\n==\s*([^=\n]+?)\s*==\s*$/gm, "");
  text = text.replace(/^==\s*([^=\n]+?)\s*==\s*$/gm, "");

  // 9. Clean up bullet points (MediaWiki uses ** for sub-bullets)
  text = text.replace(/^\s*\*\*\s*/gm, "  * ");
  text = text.replace(/^\s*\*\s*/gm, "* ");

  // 10. Clean up loose HTML tags like <small>
  text = text.replace(/<[^>]+>/g, "");

  text = text.startsWith('*') ? '*' + text : text;

  // 11. Strip excess leading/trailing whitespace
  return text.trim();
}
