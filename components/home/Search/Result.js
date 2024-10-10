import React from 'react';

export default function Result({ showResult, t }) {
    return (
        showResult && <div className="search_result">
            <div className="result_col">
                <span className="group_title">Хайлт</span>
                <span className="group_item">test</span>
            </div>
        </div>
    );
}
