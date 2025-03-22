import React, { useState, useEffect } from 'react';

// Documents section with IPFS file viewing capability
const DocumentsSection = ({ documents }) => {
  const [documentPreviews, setDocumentPreviews] = useState({});
  const [loading, setLoading] = useState({});
  
  // Function to determine file type from IPFS response
  const getFileType = (contentType) => {
    if (contentType.includes('image')) return 'image';
    if (contentType.includes('pdf')) return 'pdf';
    if (contentType.includes('text')) return 'text';
    if (contentType.includes('video')) return 'video';
    return 'unknown';
  };
  
  // Fetch and preview files from IPFS
  const fetchIpfsFile = async (cid) => {
    if (documentPreviews[cid]) return; // Don't refetch if already loaded
    
    setLoading(prev => ({ ...prev, [cid]: true }));
    try {
      // Fetch file metadata from IPFS
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      const contentType = response.headers.get('content-type');
      const fileType = getFileType(contentType);
      
      let preview;
      if (fileType === 'image') {
        preview = {
          type: 'image',
          url: `https://ipfs.io/ipfs/${cid}`
        };
      } else if (fileType === 'pdf') {
        preview = {
          type: 'pdf',
          url: `https://ipfs.io/ipfs/${cid}`
        };
      } else if (fileType === 'text') {
        const text = await response.text();
        preview = {
          type: 'text',
          content: text.substring(0, 500) + (text.length > 500 ? '...' : '')
        };
      } else if (fileType === 'video') {
        preview = {
          type: 'video',
          url: `https://ipfs.io/ipfs/${cid}`
        };
      } else {
        preview = {
          type: 'unknown',
          url: `https://ipfs.io/ipfs/${cid}`
        };
      }
      
      setDocumentPreviews(prev => ({
        ...prev,
        [cid]: preview
      }));
    } catch (error) {
      console.error(`Error fetching file ${cid} from IPFS:`, error);
      setDocumentPreviews(prev => ({
        ...prev,
        [cid]: { type: 'error', error: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [cid]: false }));
    }
  };
  
  useEffect(() => {
    // Fetch all documents when the component mounts
    documents.forEach(cid => {
      fetchIpfsFile(cid);
    });
  }, [documents]);
  
  // Render document preview based on file type
  const renderFilePreview = (cid, preview) => {
    if (!preview) return null;
    
    switch (preview.type) {
      case 'image':
        return (
          <div className="my-2 p-2 border rounded-lg">
            <img 
              src={preview.url} 
              alt={`Document ${cid}`} 
              className="max-h-64 max-w-full object-contain"
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="my-2 p-2 border rounded-lg">
            <iframe
              src={`${preview.url}#view=fitH`}
              title={`PDF ${cid}`}
              className="w-full h-64 border-0"
            />
          </div>
        );
      case 'text':
        return (
          <div className="my-2 p-2 border rounded-lg bg-gray-50">
            <pre className="text-sm overflow-auto max-h-64">
              {preview.content}
            </pre>
          </div>
        );
      case 'video':
        return (
          <div className="my-2 p-2 border rounded-lg">
            <video 
              controls 
              className="max-h-64 max-w-full"
            >
              <source src={preview.url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'error':
        return (
          <div className="my-2 p-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
            Error loading file: {preview.error}
          </div>
        );
      default:
        return (
          <div className="my-2 p-2 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <span>File type not previewable</span>
              <a
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline px-4 py-1 bg-violet-50 rounded"
              >
                Download
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Certificates / Documents</h2>
      {documents.length > 0 ? (
        <div className="space-y-6">
          {documents.map((cid, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Document #{idx + 1}</h3>
                <a
                  href={`https://ipfs.io/ipfs/${cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline text-sm"
                >
                  View on IPFS
                </a>
              </div>
              
              <div className="text-sm text-gray-500 mb-2 break-all">
                CID: {cid}
              </div>
              
              {loading[cid] ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : (
                renderFilePreview(cid, documentPreviews[cid])
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No documents uploaded yet.</p>
      )}
    </div>
  );
};

export default DocumentsSection;