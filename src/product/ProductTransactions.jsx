import "./ProductTransactions.css";
import { useState, useEffect, useRef } from "react";
import { BASE_URL, GET_ALL_PRODUCTS_NEW } from "../Constants";
import axios from "axios";

const ProductTransactions = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showImportDropdown, setShowImportDropdown] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filterActive, setFilterActive] = useState(false);
    const [filterInactive, setFilterInactive] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const dropdownRef = useRef(null);
    const importDropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const filterDropdownRef = useRef(null);
    
    // Load products from backend
    useEffect(() => {
        loadProducts();
    }, []);
    
    // Filter products when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);
    
    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/${GET_ALL_PRODUCTS_NEW}`);
            console.log(response.data);
            setProducts(response.data.products);
            setFilteredProducts(response.data.products); // Initialize filtered products
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Handle product row click
    const handleProductRowClick = (productId) => {
        setSelectedProductId(productId);
    };
    
    // Handle product actions click
    const handleProductActionsClick = (productId) => {
        console.log('Product actions clicked for:', productId);
        // TODO: Show product actions menu
    };

    // Handle clicks outside dropdowns to close them
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (importDropdownRef.current && !importDropdownRef.current.contains(event.target)) {
                setShowImportDropdown(false);
            }
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when search is shown
    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);
    
    // Handle bulk actions
    const handleBulkAction = (action) => {
        console.log(`Bulk ${action} action triggered`);
        setShowDropdown(false);
        // Add your bulk action logic here
    };

    const handleImportBulk = () => {
        console.log('Import Products in Bulk action triggered');
        setShowImportDropdown(false);
        // Add your import bulk action logic here
    };
    
    // Handle filter actions
    const handleClearFilter = () => {
        setFilterActive(false);
        setFilterInactive(false);
        setShowFilterDropdown(false);
    };
    
    const handleApplyFilter = () => {
        console.log('Filter applied:', { active: filterActive, inactive: filterInactive });
        setShowFilterDropdown(false);
        // Add your filter application logic here
    };
    
    return (
        <div className="product-transactions-container">
            <h2>Product Transactions</h2>
            
            <div className="transactions-layout">
                {/* First div - Left side, 20% width, full height */}
                <div className="left-panel">
                    {/* Left panel controls section */}
                    <div className="left-panel-controls">
                        {showSearch ? (
                            /* Search bar */
                            <div className="search-bar-container">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="search-input"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button 
                                    className="close-search-btn"
                                    onClick={() => {
                                        setShowSearch(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            /* Original controls */
                            <>
                                {/* Search icon */}
                                <div className="search-icon-container" onClick={() => setShowSearch(true)}>
                                    <span className="search-icon-btn">🔍</span>
                                </div>
                                
                                {/* Add Item button and dropdown */}
                                <div className="add-item-container">
                                    <button className="add-item-btn" onClick={() => window.location.href = '/add'}>
                                        Add Item
                                    </button>
                                    <button className="dropdown-arrow-btn" onClick={() => setShowImportDropdown(!showImportDropdown)}>
                                        <span className="dropdown-arrow">▼</span>
                                        
                                        {/* Import dropdown menu */}
                                        {showImportDropdown && (
                                            <div className="import-dropdown-menu" ref={importDropdownRef}>
                                                <div className="dropdown-item" onClick={() => handleImportBulk()}>
                                                    Import Products in Bulk
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                </div>
                                
                                {/* Three dots menu */}
                                <div className="three-dots-menu" onClick={() => setShowDropdown(!showDropdown)}>
                                    <span className="three-dots">⋮</span>
                                    
                                    {/* Dropdown menu */}
                                    {showDropdown && (
                                        <div className="dropdown-menu" ref={dropdownRef}>
                                            <div className="dropdown-item" onClick={() => handleBulkAction('inactive')}>
                                                Bulk Inactive
                                            </div>
                                            <div className="dropdown-item" onClick={() => handleBulkAction('active')}>
                                                Bulk Active
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Table header with filter */}
                    <div className="table-header-filter">
                        <div className="header-labels">
                            <span className="header-label">ITEM</span>
                            <div className="filter-section">
                                <div className="filter-icon-container" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                                    <span className="filter-icon">🔽</span>
                                    
                                    {/* Filter dropdown */}
                                    {showFilterDropdown && (
                                        <div className="filter-dropdown-menu" ref={filterDropdownRef}>
                                            <div className="filter-option">
                                                <input 
                                                    type="checkbox" 
                                                    id="active-filter"
                                                    checked={filterActive}
                                                    onChange={(e) => setFilterActive(e.target.checked)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <label htmlFor="active-filter" onClick={(e) => e.stopPropagation()}>
                                                    Active
                                                </label>
                                            </div>
                                            <div className="filter-option">
                                                <input 
                                                    type="checkbox" 
                                                    id="inactive-filter"
                                                    checked={filterInactive}
                                                    onChange={(e) => setFilterInactive(e.target.checked)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <label htmlFor="inactive-filter" onClick={(e) => e.stopPropagation()}>
                                                    InActive
                                                </label>
                                            </div>
                                            <div className="filter-actions">
                                                <button className="filter-btn clear-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClearFilter();
                                                }}>
                                                    Clear
                                                </button>
                                                <button className="filter-btn apply-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApplyFilter();
                                                }}>
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="header-label">QUANTITY</span>
                        </div>
                    </div>
                    
                    {/* Product list */}
                    <div className="product-list-container">
                        {filteredProducts.map((product, index) => (
                            <div 
                                key={product.id || index}
                                className={`product-row ${selectedProductId === product.id ? 'selected' : ''}`}
                                onClick={() => handleProductRowClick(product.id)}
                            >
                                <div className="product-name">{product.name}</div>
                                <div className={`product-quantity ${product.stock.openingQuantity > product.stock.minStock ? 'stock-adequate' : 'stock-low'}`}>
                                    {product.stock.openingQuantity}
                                </div>
                                <div className="product-actions">
                                    <div className="product-three-dots" onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductActionsClick(product.id);
                                    }}>
                                        ⋮
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Loading state */}
                        {loading && (
                            <div className="loading-message">
                                Loading products...
                            </div>
                        )}
                        
                        {/* Empty state */}
                        {!loading && filteredProducts.length === 0 && (
                            <div className="no-products-message">
                                No products found
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Container for middle and right panels */}
                <div className="middle-right-container">
                    {/* Second div - Middle, remaining width, 30% height */}
                    <div className="middle-panel">
                        {/* Content for middle panel */}
                    </div>
                    
                    {/* Third div - Right side, remaining width, 70% height */}
                    <div className="right-panel">
                        {/* Content for right panel */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductTransactions;