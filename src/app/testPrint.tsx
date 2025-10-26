"use client";

import { useRef } from "react";

type Props = {
  textToPrint: string;
};

export default function PrintButton({ textToPrint }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "", "width=700,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              /* Print specific styles */
              @media print {
                @page {
                  margin: 0;
                }
                body {
                  margin: 0;
                  font-family: Arial, sans-serif;
                  white-space: pre-wrap;
                  font-size: 14px;
                }
              }

              /* General body styles for preview in new window */
              body {
                font-family: Arial, sans-serif;
                padding: 10px;
                white-space: pre-wrap;
                font-size: 14px;
              }

              /* Optional: make lines look like a receipt */
              .line {
                border-bottom: 1px dashed #000;
                margin: 2px 0;
              }
            </style>
          </head>
          <body>
            <div>${textToPrint}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Print Receipt
      </button>

      {/* Optional: preview area */}
      <div ref={printRef} className="hidden">
        {textToPrint}
      </div>
    </div>
  );
}
