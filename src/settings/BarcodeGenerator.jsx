import React, { useState, useRef } from 'react';
import './BarcodeGenerator.css';
import ProductSelect from '../product/ProductSelect';
import Barcode from 'react-barcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PRINTER_OPTIONS = [
  { label: 'Regular Printer', value: 'regular' },
  { label: 'Thermal Printer', value: 'thermal' },
];
const SIZE_OPTIONS = [
  { label: '65 Labels (38 * 21mm)', value: '65' },
  { label: '40 Labels (50 * 25mm)', value: '40' },
  { label: 'Custom Size', value: 'custom' },
];

function getRandom11DigitCode() {
  return Math.floor(10000000000 + Math.random() * 90000000000).toString();
}

const BarcodeGenerator = () => {
  // Input states
  const [product, setProduct] = useState(null);
  const [productCode, setProductCode] = useState('');
  const [numLabels, setNumLabels] = useState('');
  const [header, setHeader] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [printer, setPrinter] = useState(PRINTER_OPTIONS[0].value);
  const [size, setSize] = useState(SIZE_OPTIONS[0].value);
  const [previewData, setPreviewData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMode, setPreviewMode] = useState('preview'); // 'preview' or 'generate'
  const [selectedRow, setSelectedRow] = useState(null);
  const pdfRef = useRef(null);

  // Handlers
  const handleGenerateCode = () => {
    setProductCode(getRandom11DigitCode());
  };

  const handleAddForBarcode = () => {
    // Validation: require product and numLabels
    if (!product || !numLabels) return;
    setTableData([
      ...tableData,
      {
        productName: product.name,
        productCode: productCode,
        numLabels,
        header,
        line1,
        line2,
        id: Date.now(),
      },
    ]);
    setNumLabels('');
    setHeader('');
    setLine1('');
    setLine2('');
    setProductCode('');
    setProduct(null);
    setPreviewData(null);
  };

  const handleAddToTable = () => {
    if (!product || !numLabels) return;
    setTableData([
      ...tableData,
      {
        productName: product.label,
        numLabels,
        header,
        line1,
        line2,
        id: Date.now(),
      },
    ]);
    // Optionally clear fields
    setNumLabels('');
    setHeader('');
    setLine1('');
    setLine2('');
    setProductCode('');
    setProduct(null);
    setPreviewData(null);
  };

  const handleDeleteRow = (id) => {
    setTableData(tableData.filter(row => row.id !== id));
  };

  const handleGenerate = (row) => {
    setSelectedRow(row);
    setPreviewMode('generate');
    setShowPreviewModal(true);
  };

  const handlePreview = (row) => {
    setSelectedRow(row);
    setPreviewMode('preview');
    setShowPreviewModal(true);
  };

  const handleSaveAndClose = async () => {
    if (!pdfRef.current) return;
    
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `barcode_labels_${selectedRow?.productName || 'product'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setShowPreviewModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Modal content for previewing multiple labels
  const renderPreviewLabels = () => {
    if (!selectedRow) return <div style={{textAlign:'center', color:'#888'}}>No data to preview</div>;
    
    const count = parseInt(selectedRow.numLabels, 10);
    if (!count || count < 1) return <div style={{textAlign:'center', color:'#888'}}>No labels to preview</div>;
    
    return Array.from({ length: count }).map((_, idx) => (
      <div className="barcode-preview-box" key={idx} style={{margin: '10px'}}>
        <div className="barcode-preview-header">{selectedRow.header || 'Header'}</div>
        <div className="barcode-preview-barcode">
          <Barcode value={selectedRow.productCode || 'Product Code'} height={15} width={1} />
        </div>
        <div className="barcode-preview-line1">{selectedRow.line1 || 'Line 1'}</div>
        <div className="barcode-preview-line2">{selectedRow.line2 || 'Line 2'}</div>
      </div>
    ));
  };

  return (
    <div className="barcode-generator-container">
      {/* Header */}
      <div className="barcode-header-row">
        <h2 className="barcode-title">Barcode Generator</h2>
        <div className="barcode-header-controls">
          <select value={printer} onChange={e => setPrinter(e.target.value)}>
            {PRINTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select value={size} onChange={e => setSize(e.target.value)}>
            {SIZE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Main Section */}
      <div className="barcode-main-row">
        {/* Inputs */}
        <div className="barcode-inputs">
          {/* Group 1: Product Name and Product Code */}
          <div className="barcode-input-group1">
            <div className="form-group-barcode">
              <label>Product Name</label>
              <ProductSelect onProductSelect={setProduct} />
            </div>
            <div className="form-group-barcode">
              <label>Product Code</label>
              <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                <input type="text" value={productCode} readOnly className="input-barcode" />
                <button type="button" className='btn-barcode' onClick={handleGenerateCode}>Generate</button>
              </div>
            </div>
          </div>
          {/* Group 2: No. Of Labels, Header, Line 1, Line 2 */}
          <div className="barcode-input-group2" style={{ display: 'flex', gap: '5px', width: '100%' }}>
            <div className="form-group-barcode group2-input">
              <label>No. Of Labels</label>
              <input type="number" value={numLabels} onChange={e => setNumLabels(e.target.value)} className="input-barcode" />
            </div>
            <div className="form-group-barcode group2-input">
              <label>Header</label>
              <input type="text" value={header} onChange={e => setHeader(e.target.value)} className="input-barcode" />
            </div>
            <div className="form-group-barcode group2-input">
              <label>Line 1</label>
              <input type="text" value={line1} onChange={e => setLine1(e.target.value)} className="input-barcode" />
            </div>
            <div className="form-group-barcode group2-input">
              <label>Line 2</label>
              <input type="text" value={line2} onChange={e => setLine2(e.target.value)} className="input-barcode" />
            </div>
          </div>
        </div>
        {/* Preview */}
        <div className="barcode-preview">
          <div className="barcode-preview-box">
            <div className="barcode-preview-header">{(previewData ? previewData.header : header) || 'Header'}</div>
            <div className="barcode-preview-barcode">
              {/* Placeholder for barcode image */}
              <Barcode value={productCode || 'Product Code'} height={15} width={1} />
            </div>
            <div className="barcode-preview-line1">{(previewData ? previewData.line1 : line1) || 'Line 1'}</div>
            <div className="barcode-preview-line2">{(previewData ? previewData.line2 : line2) || 'Line 2'}</div>
            <button className="add-barcode-btn" onClick={handleAddForBarcode}>Add For Barcode</button>
            {/* {previewData && (
              <button className="add-to-table-btn" onClick={handleAddToTable} style={{ marginTop: 4 }}>Add To Table</button>
            )} */}
          </div>
        </div>
      </div>
      {/* Table Section */}
      <div className="barcode-table-section">
        <table className="barcode-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Barcode</th>
              <th>No Of Labels</th>
              <th>Header</th>
              <th>Line 1</th>
              <th>Line 2</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                    <Barcode value={'Product Code'} height={40} width={1.5} background="#fff" lineColor="#bbb" />
                  </div>
                  <div style={{ color: '#888', fontSize: '1rem' }}>
                    Added items for Barcode generation will appear here
                  </div>
                </td>
              </tr>
            ) : (
              tableData.map(row => (
                <tr key={row.id}>
                  <td>{row.productName}</td>
                  <td>{row.productCode}</td>
                  <td>{row.numLabels}</td>
                  <td>{row.header}</td>
                  <td>{row.line1}</td>
                  <td>{row.line2}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn generate-btn" 
                        onClick={() => handleGenerate(row)}
                        title="Generate"
                      >
                        🏷️
                      </button>
                      <button 
                        className="action-btn preview-btn" 
                        onClick={() => handlePreview(row)}
                        title="Preview"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteRow(row.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Footer Buttons */}
      <div className="barcode-footer-row">
        <button className="footer-btn" onClick={() => setShowPreviewModal(true)}>Preview</button>
        <button className="footer-btn">Generate</button>
      </div>
      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="barcode-modal-overlay">
          <div className="barcode-modal-content">
            {/* Modal Header */}
            <div className="barcode-modal-header">
              <span className="barcode-modal-title">Generate</span>
              <button className="barcode-modal-close" onClick={() => setShowPreviewModal(false)}>&times;</button>
            </div>
            {/* Modal Main Preview */}
            <div className="barcode-modal-labels-area">
              <div className="barcode-modal-labels" ref={pdfRef}>
                {renderPreviewLabels()}
              </div>
            </div>
            {/* Modal Footer */}
            {previewMode === 'generate' && (
              <div className="barcode-modal-footer">
                <button className="barcode-modal-save-btn" onClick={handleSaveAndClose}>Save and Close</button>
                <button className="barcode-modal-print-btn">Print</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeGenerator;