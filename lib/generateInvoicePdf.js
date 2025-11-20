export async function generateInvoicePdf(invoice = {}, companyInfo = {}) {
  // Dynamically import jsPDF to avoid SSR issues
  const mod = await import("jspdf");
  const { jsPDF } = mod;

  // --- CONFIGURATION ---
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  let y = margin;
  const accentColor = "#007BFF"; // A professional blue
  const textColor = "#333333";
  const lightTextColor = "#666666";
  const headerBgColor = "#F5F5F5"; // Light background for the header

  // --- DATA EXTRACTION ---
  const number = invoice.number || invoice.id || "-";
  const amount = invoice.amount ?? 0;
  const status = invoice.status || "Unpaid";
  const due = invoice.dueDate || invoice.date || "-";
  const desc = invoice.description || "";
  const items = invoice.items || [];

  // format due date for display (handle Firestore Timestamp or strings)
  let dueStr = due;
  try {
    if (due?.toDate) dueStr = due.toDate().toLocaleDateString();
    else if (typeof due === "string") {
      const maybe = new Date(due);
      if (!isNaN(maybe)) dueStr = maybe.toLocaleDateString();
    }
  } catch (e) {
    dueStr = String(due);
  }

  // Determine Invoice Date
  let dateStr = new Date().toLocaleDateString();
  try {
    if (invoice?.createdAt?.toDate)
      dateStr = invoice.createdAt.toDate().toLocaleDateString();
  } catch (e) {
    /* fallback to now */
  }

  // --- HEADER SECTION (Company Info & Invoice Title) ---

  // Background box for header
  doc.setFillColor(headerBgColor);
  doc.rect(0, 0, pageWidth, y + 90, "F");

  // Company Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(textColor);
  doc.text(companyInfo.name || "Your Company", margin, y);

  // Company Contact Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(lightTextColor);
  doc.text(companyInfo.address || "", margin, y + 16);
  doc.text(
    `${companyInfo.email || ""} | ${companyInfo.phone || ""}`,
    margin,
    y + 28
  );
  y += 40;

  // Invoice Title and Number (Aligned Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(accentColor);
  doc.text("INVOICE", pageWidth - margin, y - 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(textColor);
  doc.text(`Invoice #: ${number}`, pageWidth - margin, y + 15, {
    align: "right",
  });

  y += 60; // Move past the header section

  // --- BILLING / PROJECT DETAILS ---
  const detailBoxWidth = (pageWidth - margin * 2) / 2 - 10;

  // Billing Details Box
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor);
  doc.text("Bill To", margin, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor);

  // Compose client contact lines (name, address, email, phone)
  const clientLines = [
    invoice.clientName || invoice.client?.name || "Client Name",
    invoice.clientAddress || invoice.client?.address || "",
    invoice.clientEmail || invoice.client?.email || "",
    invoice.clientPhone || invoice.client?.phone || "",
  ].filter(Boolean);

  // Print client lines as a vertical block
  doc.text(clientLines, margin, y + 16);

  // Project Details Box (Aligned Right)
  const projectX = pageWidth - margin - detailBoxWidth;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor);
  doc.text("Project Details", projectX, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor);

  // Project details block (project name, id, issued date, due date)
  const projectLines = [
    `Project: ${invoice.projectName || invoice.project || "-"}`,
    invoice.projectId || invoice.project?.id
      ? `Project ID: ${invoice.projectId || invoice.project?.id}`
      : "",
    `Date Issued: ${dateStr}`,
    `Payment Due: ${dueStr}`,
  ].filter(Boolean);

  doc.text(projectLines, projectX, y + 16);

  // Advance Y taking into account the printed blocks' height
  const clientBlockHeight = Math.max(1, clientLines.length) * 14;
  const projectBlockHeight = Math.max(1, projectLines.length) * 14;
  y += Math.max(65, Math.max(clientBlockHeight, projectBlockHeight) + 40);

  // --- AMOUNT DUE BLOCK (The most prominent element) ---

  doc.setDrawColor(accentColor);
  doc.setFillColor("#E6F2FF"); // Lighter blue background
  doc.rect(margin, y, pageWidth - margin * 2, 80, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(accentColor);
  doc.text("Amount Due (USD)", margin + 15, y + 25);

  doc.setFontSize(30);
  doc.setTextColor(textColor);
  doc.text(
    `$${Number(amount).toLocaleString()}`,
    pageWidth - margin - 15,
    y + 35,
    { align: "right" }
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor);
  doc.text(`Status: ${status}`, pageWidth - margin - 15, y + 55, {
    align: "right",
  });
  y += 100;

  // --- DESCRIPTION / NOTES ---
  if (desc) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Notes:", margin, y);
    y += 18;

    const split = doc.splitTextToSize(desc, pageWidth - margin * 2);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightTextColor);
    doc.text(split, margin, y);
    y += split.length * 14 + 16;
  }

  // --- ITEMIZED LIST ---
  if (items.length) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Item Details", margin, y);
    y += 25;

    // Column Definitions
    const colDesc = margin;
    const colQty = pageWidth - margin - 180;
    const colUnit = pageWidth - margin - 110;
    const colTotal = pageWidth - margin - 40; // Reduced margin for total

    // Column Headers
    doc.setFillColor("#EFEFEF");
    doc.rect(margin, y - 16, pageWidth - margin * 2, 20, "F"); // Header row background
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Description", colDesc, y);
    doc.text("Qty", colQty, y, { align: "right" });
    doc.text("Unit Price", colUnit, y, { align: "right" });
    doc.text("Total", colTotal, y, { align: "right" });
    y += 10;

    doc.setDrawColor("#DDDDDD");
    doc.line(margin, y, pageWidth - margin, y); // Separator line
    y += 10;

    let itemsTotal = 0;

    items.forEach((it, index) => {
      const lineTotal = Number(it.qty || 0) * Number(it.unitPrice || 0);
      itemsTotal += lineTotal;

      const descLines = doc.splitTextToSize(
        it.description || "",
        colQty - colDesc - 20
      );
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(lightTextColor);

      // Item description
      doc.text(descLines, colDesc, y);

      // Other columns (aligned right)
      const lineStart =
        y + (descLines.length > 1 ? (descLines.length - 1) * 6 : 0); // vertically align totals to the bottom of the description
      doc.text(String(it.qty || 0), colQty, lineStart, { align: "right" });
      doc.text(
        `$${Number(it.unitPrice || 0).toLocaleString()}`,
        colUnit,
        lineStart,
        { align: "right" }
      );
      doc.text(`$${Number(lineTotal).toLocaleString()}`, colTotal, lineStart, {
        align: "right",
      });

      y += Math.max(20, descLines.length * 12); // Advance y position
      if (y > pageHeight - 120) {
        doc.addPage();
        y = margin;
      }
    });

    // --- TOTALS SECTION ---
    y += 15;
    const totalBoxX = pageWidth - margin - 200; // Right-aligned box start
    const totalBoxWidth = 200;

    doc.setDrawColor("#CCCCCC");
    doc.line(totalBoxX, y, pageWidth - margin, y); // Line above subtotal
    y += 8;

    // Subtotal
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightTextColor);
    doc.text("Subtotal:", totalBoxX, y);
    doc.text(`$${Number(itemsTotal).toLocaleString()}`, colTotal, y, {
      align: "right",
    });
    y += 18;

    // Grand Total (Highlighted)
    doc.setFillColor(accentColor);
    doc.rect(totalBoxX, y, totalBoxWidth, 25, "F"); // Highlight box

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#FFFFFF"); // White text for contrast
    doc.text("GRAND TOTAL:", totalBoxX + 10, y + 17);
    doc.text(
      `$${Number(amount || itemsTotal).toLocaleString()}`,
      colTotal,
      y + 17,
      { align: "right" }
    );
    y += 40;
  }

  // --- FOOTER ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor);
  doc.text(
    "Thank you for your business. Please contact us with any questions.",
    margin,
    pageHeight - 40
  );

  // --- OUTPUT ---
  const blob = doc.output("blob");
  const filename = `invoice-${number}.pdf`;
  return { blob, filename };
}
