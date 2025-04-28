import React, { useState } from 'react';

export default function FilterSidebar() {
    const [activeLetter, setActiveLetter] = useState(''); 
    const [activeLetterObserve, setActiveLetterObserve] = useState('Бүгд'); 
    const filterDataWord = [
        { letter: 'А', count: 51 },
        { letter: 'Б', count: 24 },
        { letter: 'В', count: 0 },
        { letter: 'Г', count: 15 },
        { letter: 'Д', count: 26 },
        { letter: 'Е', count: 8 },
        { letter: 'Ё', count: 0 },
        { letter: 'Ж', count: 1 },
        { letter: 'З', count: 22 },
        { letter: 'И', count: 3 },
        { letter: 'К', count: 8 },
        { letter: 'Л', count: 0 },
        { letter: 'М', count: 17 },
        { letter: 'Н', count: 79 },
        { letter: 'О', count: 8 },
        { letter: 'Ө', count: 5 },
        { letter: 'П', count: 1 },
        { letter: 'Р', count: 0 },
        { letter: 'С', count: 13 },
        { letter: 'Т', count: 42 },
        { letter: 'У', count: 20 },
        { letter: 'Ү', count: 9 },
        { letter: 'Ф', count: 0 },
        { letter: 'Х', count: 57 },
        { letter: 'Ц', count: 11 },
        { letter: 'Ч', count: 0 },
        { letter: 'Ш', count: 7 },
        { letter: 'Э', count: 16 },
        { letter: 'Ю', count: 0 },
        { letter: 'Я', count: 3 }
    ];
    const filterDataObserve = [
        { letter: 'Бүгд', count: 51 },
        { letter: '7 хоног', count: 24 },
        { letter: 'Сар', count: 0 },
        { letter: 'Улирал', count: 15 },
        { letter: 'Хагас жил', count: 26 },
        { letter: 'Жил', count: 8 },
        { letter: 'Бусад (бичих)', count: 0 }
    ];

    const chunkedData = [];
    for (let i = 0; i < filterDataWord.length; i += 6) {
        chunkedData.push(filterDataWord.slice(i, i + 6));
    }

    return (     
            <div className="__filter_sidebar_words">
                <h4>Ажиглалтын хугацаа</h4>
                <div className="__filter_sidebar_item">
                    <ul>
                        {filterDataObserve.map((item) => (
                            <li key={item.letter}>
                                <a
                                    className={activeLetterObserve === item.letter ? 'active' : ''}
                                    onClick={() => setActiveLetterObserve(item.letter)}
                                >
                                    {item.letter} <span>{item.count}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <h4>Эхний үсгээр</h4>
                {chunkedData.map((group, index) => (
                    <div key={index} className="__filter_sidebar_word_row">
                        {group.map((item) => (
                            <div key={item.letter} className="__filter_sidebar_word_col">
                                <div
                                    className={`__filter_word_item ${activeLetter === item.letter ? 'active' : ''}`}
                                    onClick={() => setActiveLetter(item.letter)}
                                >
                                    {item.letter}
                                    <span className="count">{activeLetter === item.letter ? item.count : ''}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
    );
}
