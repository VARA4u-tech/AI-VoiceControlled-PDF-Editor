export async function exportToWord(
  fileName: string,
  paragraphs: string[]
): Promise<void> {
  const safeName = (fileName || "gilded-scribe-export").replace(
    /[^a-z0-9_-]/gi,
    "_"
  );

  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${safeName}</title></head><body>`;
      
  const footer = "</body></html>";
  const sourceHTML = header + paragraphs.join("<br/><br/>") + footer;

  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
