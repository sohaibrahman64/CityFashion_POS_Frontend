import './AddSupplier.css';
import SupplierForm from './SupplierForm';
import { useState } from 'react';

const AddSupplier = () => {

  return (
    <div className="add-supplier-container">
      <h2>Add Supplier</h2>
      <SupplierForm />
    </div>
  );
};

export default AddSupplier;