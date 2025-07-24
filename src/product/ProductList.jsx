import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import ProductTable from "./ProductTable";
import {
  BASE_URL,
  DELETE_PRODUCT,
  GET_ALL_CATEGORIES,
  GET_ALL_PRODUCTS,
} from "../Constants";
import ProductEditModal from "./ProductEditModal"; 
import "./ProductList.css";
import BarcodeStickerPrint from "./BarcodeStickerPrint";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  // Edit button click
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await axios.delete(`${BASE_URL}/${DELETE_PRODUCT}/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Export to Excel
  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/${GET_ALL_PRODUCTS}`).then((res) => {
      setProducts(res.data);
      setFilteredProducts(res.data);
    });

    axios.get(`${BASE_URL}/${GET_ALL_CATEGORIES}`).then((res) => {
      setCategories(res.data);
    });
  }, []);

  // Client-side search filter (like CustomerList)
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredProducts(
      products.filter((p) =>
        (p.barcode?.toLowerCase().includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q) ||
          p.size?.toLowerCase().includes(q) ||
          p.mrp?.toString().includes(q)
        )
      )
    );
  }, [search, products]);

  return (
    <div className="barcode-preview">
      {showBarcodePreview ? (
        <BarcodeStickerPrint
          selectedProducts={selectedProducts}
        />
      ) : (
        <>
          <div className="product-list-header">
            <h2>Product List</h2>
            <button onClick={handleExportToExcel} className="export-button">
              Export to Excel
            </button>
          </div>
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <input
              type="text"
              placeholder="Search by barcode, name, category, size, price..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '60%',
                maxWidth: 400,
                fontSize: 15,
                margin: '0 auto',
              }}
            />
          </div>
          {selectedProducts.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="print-barcodes-button" onClick={() => setShowBarcodePreview(true)}>
                Print Barcodes
              </button>
            </div>
          )}

          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            setSelectedProducts={setSelectedProducts}
          />
          <ProductEditModal
            show={showModal}
            onClose={() => setShowModal(false)}
            product={selectedProduct}
            onSave={(updated) => {
              const updatedList = products.map((p) =>
                p.id === updated.id ? updated : p
              );
              setProducts(updatedList);
              setFilteredProducts(updatedList);
              setShowModal(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ProductList;
