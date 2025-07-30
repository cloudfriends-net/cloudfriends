import React, { useEffect, useState } from 'react';

type PDFPreviewProps = {
  previewUrl: string;
  fileName: string;
  onClose: () => void;
  onPageCountDetermined: (pageCount: number) => void;
};

const PDFPreview: React.FC<PDFPreviewProps> = ({ previewUrl, fileName, onClose, onPageCountDetermined }) => {
  const [loading, setLoading] = useState<boolean>(true);

  // Use pdfjs to determine the actual page count
  useEffect(() => {
    // Attempt to load the PDF and get the page count
    const getPdfPageCount = async () => {
      try {
        // Using fetch to get the PDF binary data
        const response = await fetch(previewUrl);
        const pdfBlob = await response.blob();
        
        // Create a URL from the blob
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        // Create an iframe element to load the PDF
        const tempFrame = document.createElement('iframe');
        tempFrame.style.display = 'none';
        document.body.appendChild(tempFrame);
        
        tempFrame.onload = () => {
          // Try to access PDF information
          try {
            // For many PDFs, we can estimate the page count by checking elements
            // This is a rough approximation
            const frameDoc = tempFrame.contentDocument || tempFrame.contentWindow?.document;
            if (frameDoc) {
              // Most PDF viewers create page divs
              const pageElements = frameDoc.querySelectorAll('.page, .pdf-page');
              const estimatedPageCount = pageElements.length || 1;
              
              console.log('Estimated PDF page count:', estimatedPageCount);
              onPageCountDetermined(Math.max(1, estimatedPageCount));
            } else {
              // Default to 1 if we can't determine
              onPageCountDetermined(1);
            }
          } catch (err) {
            console.warn('Could not determine page count:', err);
            onPageCountDetermined(1);
          }
          
          // Clean up
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(tempFrame);
          setLoading(false);
        };
        
        // Set src to the blob URL to trigger onload
        tempFrame.src = blobUrl;
      } catch (err) {
        console.error('Error loading PDF for page count determination:', err);
        onPageCountDetermined(1);
        setLoading(false);
      }
    };
    
    getPdfPageCount();
  }, [previewUrl, onPageCountDetermined]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-2xl w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">{fileName}</h2>
        
        {loading && <div className="w-full text-center py-4">Loading PDF...</div>}
        
        <iframe
          src={previewUrl}
          title={fileName}
          className="w-full h-96 border rounded"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

export default PDFPreview;