import { useState } from "react";
import AsyncSelect from "react-select/async";
import "./UnitSelect.css";

const UnitSelect = ({ onUnitSelect }) => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Predefined units
  const predefinedUnits = [
    { label: "BAGS (Bag)", value: "BAGS", unit: "Bag" },
    { label: "BOTTLES (Bt)", value: "BOTTLES", unit: "Bt" },
    { label: "BOX (Box)", value: "BOX", unit: "Box" },
    { label: "BUNDLES (Bdl)", value: "BUNDLES", unit: "Bdl" },
    { label: "CANS (Can)", value: "CANS", unit: "Can" },
    { label: "NUMBERS (Nos)", value: "NUMBERS", unit: "Nos" },
    { label: "PIECES (Pc)", value: "PIECES", unit: "Pc" },
    { label: "KILOGRAMS (Kg)", value: "KILOGRAMS", unit: "Kg" },
    { label: "LITERS (L)", value: "LITERS", unit: "L" },
    { label: "METERS (M)", value: "METERS", unit: "M" },
    { label: "PAIRS (Pr)", value: "PAIRS", unit: "Pr" },
    { label: "SETS (Set)", value: "SETS", unit: "Set" },
  ];

  const loadOptions = async (inputValue) => {
    let options = [...predefinedUnits];
    
    if (inputValue) {
      const filtered = options.filter(opt => 
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        opt.unit.toLowerCase().includes(inputValue.toLowerCase())
      );
      
      if (filtered.length === 0) {
        return [
          {
            label: `➕ Add "${inputValue}"`,
            value: "__add_new__",
            inputValue,
            isAddNew: true,
          },
        ];
      }
      return filtered;
    }
    return options;
  };

  const handleChange = (option) => {
    if (option.isAddNew) {
      setUnitName(option.inputValue);
      setShowModal(true);
      return;
    }
    setSelectedUnit(option);
    if (onUnitSelect) {
      onUnitSelect(option);
    }
  };

  const handleAddUnit = () => {
    const newUnit = {
      label: `${unitName.toUpperCase()} (${unitName})`,
      value: unitName.toUpperCase(),
      unit: unitName,
    };
    setSelectedUnit(newUnit);
    if (onUnitSelect) {
      onUnitSelect(newUnit);
    }
    setShowModal(false);
    setUnitName("");
  };

  return (
    <div className="unit-select-container">
      <AsyncSelect
        styles={{
          control: (base, state) => ({
            ...base,
            border: "1px solid #ccc",
            borderRadius: "6px",
            minHeight: "38px",
            boxShadow: state.isFocused ? "0 0 0 2px #0a69b933" : "none",
            "&:hover": {
              borderColor: "#999",
            },
          }),
          input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0 10px",
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: "38px",
          }),
        }}
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        value={selectedUnit}
        onChange={handleChange}
        placeholder="Select unit"
        inputValue={inputValue}
        onInputChange={setInputValue}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No unit found." : "Type to search units"
        }
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Unit</h3>
            <div className="form-grid">
              <label>
                Unit Name:
                <input
                  type="text"
                  placeholder="Unit Name"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  required
                  className="modal-input"
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" onClick={handleAddUnit}>Add Unit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitSelect; 