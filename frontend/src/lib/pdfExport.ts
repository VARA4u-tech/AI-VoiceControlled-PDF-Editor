import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPdf(
  fileName: string,
  paragraphs: string[],
): Promise<void> {
  const safeName = (fileName || "gilded-scribe-export").replace(
    /[^a-z0-9_-]/gi,
    "_",
  );

  // Create a hidden container for the PDF content to render via browser.
  // By rendering HTML through the browser, we natively support complex
  // Indic scripts (Telugu, Hindi) and their conjuncts automatically.
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  // standard A4 ratio width
  const pdfWidthPx = 800;
  container.style.width = `${pdfWidthPx}px`;
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1e1e1e";
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";
  container.style.padding = "40px";
  container.style.boxSizing = "border-box";

  // Build the Header
  const header = document.createElement("div");
  header.style.backgroundColor = "rgb(10, 20, 20)";
  header.style.margin = "-40px -40px 30px -40px";
  header.style.padding = "20px 40px";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "baseline";
  header.style.borderBottom = "3px solid rgb(180, 140, 60)";

  const title = document.createElement("h1");
  title.innerText =
    fileName || "Voice Controlled PDF Editor — Exported Document";
  title.style.margin = "0";
  title.style.fontSize = "22px";
  title.style.color = "rgb(180, 140, 60)"; // gold
  title.style.fontFamily = "sans-serif";
  title.style.fontWeight = "bold";

  const dateSpan = document.createElement("span");
  dateSpan.innerText = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  dateSpan.style.color = "rgb(100, 120, 110)";
  dateSpan.style.fontSize = "16px";

  header.appendChild(title);
  header.appendChild(dateSpan);
  container.appendChild(header);

  // Build Paragraphs
  paragraphs.forEach((para, idx) => {
    if (!para.trim()) return;

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.marginBottom = "20px";
    wrapper.style.alignItems = "flex-start";

    const num = document.createElement("div");
    num.innerText = `[${String(idx + 1).padStart(2, "0")}]`;
    num.style.fontFamily = "monospace";
    num.style.color = "rgb(140, 170, 160)";
    num.style.fontSize = "14px";
    num.style.minWidth = "45px";
    num.style.marginRight = "10px";
    num.style.paddingTop = "2px";

    const text = document.createElement("div");
    text.innerText = para;
    text.style.fontSize = "16px";
    text.style.lineHeight = "1.6";
    text.style.color = "rgb(30, 30, 30)";
    text.style.flex = "1";
    text.style.wordWrap = "break-word";
    // Important: preserve line breaks from the original text if needed
    text.style.whiteSpace = "pre-wrap";

    wrapper.appendChild(num);
    wrapper.appendChild(text);
    container.appendChild(wrapper);
  });

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution for text clarity in the PDF
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pdfWidthMm = 210;
    const pdfHeightMm = 297;

    // The margin in rendering ensures text doesn't touch the very edge,
    // but we can also pad the pages directly if needed.
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgHeight / imgWidth;
    const scaledHeightMm = pdfWidthMm * ratio;

    let heightLeft = scaledHeightMm;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidthMm, scaledHeightMm);
    heightLeft -= pdfHeightMm;

    // Handle multi-page offsets manually by creating new pages
    // and repositioning the giant canvas upwards.
    while (heightLeft > 0) {
      position -= pdfHeightMm;
      // create a clean offset padding so it acts like a margin
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidthMm, scaledHeightMm);
      heightLeft -= pdfHeightMm;
    }

    pdf.save(`${safeName}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
    alert("There was an error generating the PDF.");
  } finally {
    document.body.removeChild(container);
  }
}
