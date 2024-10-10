import React from 'react';

export default function MainSearch({ setShowResult, t }) {
    return (
        <span className="__search">
            <input className="p-autocomplete-input p-inputtext p-component"
                placeholder={t("download.search")}
                onChange={(e) => {
                    if (1 <= e.target.value.length) {
                        setShowResult(true)
                    } else {
                        setShowResult(false)
                    }
                }}
            />
            <button className="p-autocomplete-dropdown  p-ripple p-button p-component p-button-icon-only"
                style={{
                    width: 60,
                    borderRadius: 0,
                    border: 0,
                    background: "var(--surface-c)"
                }}>
                <span className="p-button-icon pi pi-search"></span>
                <span className="p-button-label"></span>
            </button>
        </span>
    );
}
