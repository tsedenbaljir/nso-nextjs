export default function Tr({ item, lng, index, hideTime = false, yearMonthOnly = false }) {
    const published_date = new Date(item.published_date);

    const formattedDate = yearMonthOnly
        ? (lng === "mn"
            ? `${published_date.getFullYear()} оны ${published_date.getMonth() + 1} сар`
            : new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(published_date))
        : (lng === "mn"
            ? `${published_date.getMonth() + 1} сарын ${published_date.getDate()}`
            : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(published_date));

    const formattedTime = `${published_date.getHours()}:${published_date.getMinutes().toString().padStart(2, '0')}`;

    const specDate = yearMonthOnly
        ? (lng === "mn"
            ? `${published_date.getFullYear()} оны ${published_date.getMonth() + 1} сар`
            : new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(published_date))
        : item.published_date.substr(0, 10);

    return (<tr key={index}>
        <td>{item.slug}</td>
        <td>
            {item.news_type === "LATEST" ? (
                <a
                    className="cursor-pointer hover:text-blue-400 hover:underline"
                    href={`/${lng}/dissemination/${item.id}`}
                    target="_blank"
                >
                    {item.name}
                </a>
            ) : (
                item.name
            )}
            <div className="__table_spec">
                <span>{specDate}</span>
                {(new Date(item.published_date) > new Date()) && (
                    <span className="__table_views">
                        {lng === "mn" ? 'Хугацаа болоогүй' : 'Soon'}
                    </span>
                )}
            </div>
        </td>
        <td>{formattedDate}</td>
        {!hideTime && <td>{formattedTime}</td>}
    </tr>
    );
}
