import React, { useRef, useEffect } from "react";
import Barcode from "react-barcode";
import "./BarcodeStickerPrint.css";

const BarcodeStickerPrint = ({ selectedProducts, triggerPrint }) => {
  const printRef = useRef();


  const handlePrint = () => {
    if (selectedProducts.length > 0) {
      window.print();
    }
  }

  return (
    <div ref={printRef} className="barcode-print-container">
      {selectedProducts.map((product) => (
        <div key={product.id} className="barcode-sticker">
          <div className="product-name">{product.name}</div>
          <div className="product-size">{product.size}</div>
          <Barcode value={product.barcode} height={40} width={1.5} />
          <div className="product-price">₹{product.mrp}</div>
        </div>
      ))}
      <div className="print-buttons">
          <button onClick={handlePrint}>🖨️ Print Barcode</button>
        </div>
    </div>
  );
};

export default BarcodeStickerPrint;
