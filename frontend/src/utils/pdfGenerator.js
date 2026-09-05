import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

// 1. Generate A4 Detailed Tax Invoice PDF
export const exportInvoicePDF = (order) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('THREADCRAFT APPAREL & CO.', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Garments, Bespoke Tailoring & Textile Solutions', 14, 25);
  doc.text('GSTIN: 27AABCT3518Q1ZS | Phone: +1 (555) 234-5678 | contact@threadcraft.com', 14, 30);

  // Invoice Title & Meta
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE / CASH MEMO', 14, 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${order.invoiceNo || order.id}`, 14, 52);
  doc.text(`Date & Time: ${order.date || new Date().toLocaleString()}`, 14, 57);
  doc.text(`Payment Mode: ${(order.paymentMethod || 'CASH').toUpperCase()}`, 14, 62);
  doc.text(`Cashier / Operator: ${order.cashier || 'Admin'}`, 14, 67);

  // Customer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(120, 40, 76, 28, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO (CUSTOMER):', 124, 46);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(order.customerName || 'Walk-in Retail Customer', 124, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 124, 58);
  doc.text(`Address/City: ${order.customerAddress || 'Local Store'}`, 124, 63);

  // Items Table
  const tableRows = (order.items || []).map((item, index) => [
    index + 1,
    `${item.name}\n[Variant: ${item.size || 'M'} | Color: ${item.color || 'Standard'}]`,
    item.barcode || item.sku || 'SKU-00',
    item.quantity || 1,
    formatCurrency(item.price),
    `${item.discount || 0}%`,
    formatCurrency(item.price * (item.quantity || 1) * (1 - (item.discount || 0) / 100)),
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['#', 'Item Description & Specs', 'SKU / Barcode', 'Qty', 'Unit Price', 'Disc', 'Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 30 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 28, halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Summary Totals Box
  const summaryX = 120;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, finalY, 76, 40, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryX + 4, finalY + 7);
  doc.text(formatCurrency(order.subtotal || order.total * 0.88), 190, finalY + 7, { align: 'right' });

  doc.text('Tax / GST (12%):', summaryX + 4, finalY + 14);
  doc.text(formatCurrency(order.tax || order.total * 0.12), 190, finalY + 14, { align: 'right' });

  doc.text('Discount Applied:', summaryX + 4, finalY + 21);
  doc.text(`-${formatCurrency(order.discountTotal || 0)}`, 190, finalY + 21, { align: 'right' });

  doc.setDrawColor(79, 70, 229);
  doc.line(summaryX + 4, finalY + 26, summaryX + 72, finalY + 26);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Grand Total:', summaryX + 4, finalY + 34);
  doc.text(formatCurrency(order.total || 0), 190, finalY + 34, { align: 'right' });

  // Terms & Conditions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Terms & Conditions:', 14, finalY + 10);
  doc.text('1. Goods once sold can be exchanged within 7 days with original tag and bill.', 14, finalY + 16);
  doc.text('2. Alterations are complimentary for the first 30 days of purchase.', 14, finalY + 22);
  doc.text('3. Custom-tailored / bespoke garments are non-refundable.', 14, finalY + 28);
  doc.text('Thank you for choosing ThreadCraft Apparel! Visit again.', 14, finalY + 36);

  // Authorized Signature
  doc.line(14, finalY + 58, 70, finalY + 58);
  doc.text('Customer Signature', 14, finalY + 63);

  doc.line(135, finalY + 58, 190, finalY + 58);
  doc.text('Authorized Store Signatory', 135, finalY + 63);

  // Save PDF
  doc.save(`Invoice_${order.invoiceNo || order.id}.pdf`);
};

// 2. Generate Tailor Job Card & Measurement Sheet PDF
export const exportTailorJobCardPDF = (booking, measurements) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MASTER TAILOR JOB CARD & CUTTING SHEET', 14, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking Ref: #${booking.bookingNo || booking.id} | Garment: ${booking.garmentType || 'Custom Garment'}`, 14, 23);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(`Customer Name: ${booking.customerName}`, 14, 40);
  doc.text(`Phone: ${booking.customerPhone || 'N/A'}`, 14, 46);
  doc.text(`Assigned Master: ${booking.assignedMaster || 'Senior Tailor'}`, 14, 52);

  doc.text(`Trial Date: ${formatDate(booking.trialDate)}`, 110, 40);
  doc.text(`Delivery Date: ${formatDate(booking.deliveryDate)}`, 110, 46);
  doc.text(`Fabric: ${booking.fabricDetails || 'Customer Provided'}`, 110, 52);

  // Measurement Specs Table
  const mList = Object.entries(measurements || {}).map(([key, val]) => [
    key.replace(/([A-Z])/g, ' $1').toUpperCase(),
    `${val} inches`,
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Body Part / Measurement Point', 'Specification (Inches)']],
    body: mList.length ? mList : [['Standard Fit', 'No custom alterations specified']],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'bold' },
      1: { cellWidth: 80, halign: 'center' },
    },
  });

  const nextY = doc.lastAutoTable.finalY + 10;

  // Tailor Styling Instructions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Styling & Construction Instructions:', 14, nextY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, nextY + 4, 180, 24, 2, 2, 'FD');

  doc.text(
    booking.specialInstructions ||
      '• Standard double-needle stitching on seams.\n• Fused collar and cuffs with premium canvas lining.\n• Hand-sewn horn buttons and reinforced pocket welts.',
    18,
    nextY + 11
  );

  doc.save(`JobCard_${booking.bookingNo || booking.id}.pdf`);
};

// 3. Generate Employee Salary Slip PDF
export const exportSalarySlipPDF = (employee, salaryData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('THREADCRAFT APPAREL FACTORY', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`MONTHLY SALARY & PERFORMANCE PAYSLIP - ${salaryData.month || 'Current Month'}`, 14, 24);

  // Employee details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Employee ID: ${employee.empId || employee.id}`, 14, 42);
  doc.text(`Name: ${employee.name}`, 14, 48);
  doc.text(`Designation: ${employee.role || 'Staff'}`, 14, 54);
  doc.text(`Pay Type: ${(employee.payType || 'fixed').toUpperCase()}`, 14, 60);

  doc.text(`Attendance Days: ${salaryData.presentDays || 26} / ${salaryData.totalDays || 30}`, 110, 42);
  doc.text(`Overtime Hours: ${salaryData.otHours || 0} hrs`, 110, 48);
  doc.text(`Pieces Completed: ${salaryData.piecesDone || 0} pcs`, 110, 54);
  doc.text(`Performance Rating: ${employee.performanceScore || '4.8'}/5.0`, 110, 60);

  // Breakdown Table
  const otherEarningsLabel = salaryData.customBonus > 0 
    ? `Special Bonus (${salaryData.customBonusNote || 'Owner Reward'})` 
    : 'Sales Target / Quality Bonus';
  const otherEarningsVal = salaryData.customBonus > 0 
    ? formatCurrency((salaryData.performanceBonus || 0) + salaryData.customBonus)
    : formatCurrency(salaryData.bonus || 0);

  const otherDeductionLabel = salaryData.customDeduction > 0 
    ? `Other Deduction (${salaryData.customDeductionNote || 'Adjustment'})` 
    : 'Other Deductions';
  const otherDeductionVal = formatCurrency(salaryData.customDeduction || 0);

  const rows = [
    ['Base Salary / Minimum Guaranteed', formatCurrency(salaryData.basePay || 0), 'Advance Loan Deduction', formatCurrency(salaryData.advanceDeduction || 0)],
    [`Piece / Sales Earnings (${salaryData.piecesDone || 0} pcs)`, formatCurrency(salaryData.pieceEarnings || 0), 'Late / Unpaid Leave Penalty', formatCurrency(salaryData.leaveDeductions || 0)],
    [`Overtime Pay (${salaryData.otHours || 0} hrs)`, formatCurrency(salaryData.otEarnings || 0), 'Tax / Standard Deduction', formatCurrency(salaryData.taxDeduction || 0)],
    [otherEarningsLabel, otherEarningsVal, otherDeductionLabel, otherDeductionVal],
  ];

  autoTable(doc, {
    startY: 68,
    head: [['Earnings Head', 'Amount', 'Deductions Head', 'Amount']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 40, halign: 'right' },
      2: { cellWidth: 55 },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  const nextY = doc.lastAutoTable.finalY + 12;

  // Net Pay Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, nextY, 182, 28, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Gross Earnings: ${formatCurrency(salaryData.grossEarnings)}`, 20, nextY + 9);
  doc.text(`Total Deductions: ${formatCurrency(salaryData.totalDeductions)}`, 20, nextY + 16);
  doc.text(`Remaining Advance Balance: ${formatCurrency(employee.advanceLoanRemaining || 0)}`, 20, nextY + 23);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY PAYABLE:', 100, nextY + 14);
  doc.text(formatCurrency(salaryData.netPay), 185, nextY + 14, { align: 'right' });

  doc.save(`Payslip_${employee.empId || employee.id}_${salaryData.month || 'Month'}.pdf`);
};
