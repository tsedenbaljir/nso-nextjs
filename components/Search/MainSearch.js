"use client";
import { useState, useCallback, useRef } from "react";
import axios from "axios";
import debounce from 'lodash/debounce';

export default function MainSearch({ setShowResult, t, setData, setLoading, setSearching }) {
    const [searchTerm, setSearchTerm] = useState("");
    const searchRef = useRef(null);

    const performSearch = async (value) => {
        try {
            setLoading(true);
            const response = await axios.post("/api/elastic_search", {
                values: value,
            });

            const resdata = JSON.parse(response.data.response);
            const groupedData = resdata.hits.hits.reduce((acc, item) => {
                if (item.highlight) {
                    const key = item._source._type;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(item);
                }
                return acc;
            }, {});

            setData(groupedData);
        } catch (error) {
            console.error("Search error:", error);
            setData({});
        } finally {
            setLoading(false);
        }
    };

    // Debounce the search to avoid too many API calls
    const debouncedSearch = useCallback(
        debounce((value) => {
            if (value.length > 2) {
                performSearch(value);
                setShowResult(true);
            } else {
                setData({});
                setShowResult(false);
            }
        }, 300),
        []
    );

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        setSearching(value);
        debouncedSearch(value);
    };

    const handleSearchClick = () => {
        if (searchTerm.length > 2) {
            performSearch(searchTerm);
            setShowResult(true);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && searchTerm.length > 2) {
            performSearch(searchTerm);
            setShowResult(true);
        }
    };

    return (
        <span className="__search">
            <input
                ref={searchRef}
                className="p-autocomplete-input p-inputtext p-component"
                placeholder={t("download.search")}
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
            />
            <button 
                className="p-autocomplete-dropdown p-ripple p-button p-component p-button-icon-only"
                onClick={handleSearchClick}
                style={{
                    width: 60,
                    borderRadius: 0,
                    border: 0,
                    background: "var(--surface-c)"
                }}
            >
                <span className="p-button-icon pi pi-search"></span>
                <span className="p-button-label"></span>
            </button>
        </span>
    );
}
