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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
            </button>
        </span>
    );
}
