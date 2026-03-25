import React, { useState } from 'react';

export default function QuestionnaireFilterLetter({ handleFilterChange, t }) {
    const [activeLetter, setActiveLetter] = useState('');

    const filterDataWord = [
        { letter: 'А' }, { letter: 'Б' }, { letter: 'В' }, { letter: 'Г' },
        { letter: 'Д' }, { letter: 'Е' }, { letter: 'Ё' }, { letter: 'Ж' },
        { letter: 'З' }, { letter: 'И' }, { letter: 'К' }, { letter: 'Л' },
        { letter: 'М' }, { letter: 'Н' }, { letter: 'О' }, { letter: 'Ө' },
        { letter: 'П' }, { letter: 'Р' }, { letter: 'С' }, { letter: 'Т' },
        { letter: 'У' }, { letter: 'Ү' }, { letter: 'Ф' }, { letter: 'Х' },
        { letter: 'Ц' }, { letter: 'Ч' }, { letter: 'Ш' }, { letter: 'Э' },
        { letter: 'Ю' }, { letter: 'Я' }
    ];

    const chunkedData = [];
    for (let i = 0; i < filterDataWord.length; i += 6) {
        chunkedData.push(filterDataWord.slice(i, i + 6));
    }

    return (
        <div className="__filter_sidebar_words">
            <span className="filter-title mx-3">{t('filter.startWith')}</span>
            {chunkedData.map((group, index) => (
                <div key={index} className="__filter_sidebar_word_row mb-2">
                    {group.map((item) => (
                        <div key={item.letter} className="__filter_sidebar_word_col">
                            <div
                                className={`__filter_word_item ${activeLetter === item.letter ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveLetter(item.letter);
                                    handleFilterChange(item.letter); 
                                }}
                            >
                                {item.letter}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
