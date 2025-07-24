import React, { useState } from "react";
import axios from "axios";
import AddProductForm from "./AddProductForm";

const AddNewProduct = () => {
    return (
        <div className="add-product-form-container">
            <h2>Add New Product</h2>
            <AddProductForm />
        </div>
    );
};

export default AddNewProduct;