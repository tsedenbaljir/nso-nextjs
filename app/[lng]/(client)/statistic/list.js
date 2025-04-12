import Link from "next/link";
import { sectors_list } from './sectors';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";

export default function Tabs({ lng, type, menuItems, loading, pagination, setPagination }) {

    // Function to check if file is a PDF
    const getCheckItemExtension = (item, extension) => {
        return item.name.toLowerCase().endsWith(`.${extension}`);
    };

    // Function to handle file download
    const onDownloadDirect = async (fileInfo) => {
        const url = `https://downloads.1212.mn/${JSON.parse(fileInfo).pathName}`;
        window.open(url, "_blank");
    };


    // Function to get file extension
    const getExtension = (file_info) => {
        try {
            const fileInfo = file_info ? JSON.parse(file_info) : null;
            return fileInfo?.extension ? fileInfo.extension.toUpperCase() : "N/A"; // Handle missing extension
        } catch (error) {
            console.error("Error parsing fileInfo:", error);
            return "N/A"; // Fallback if JSON is invalid
        }
    };


    // Pagination Handler
    const onPageChange = (event) => {
        setPagination({
            ...pagination,
            first: event.first,
            rows: event.rows,
        });
    };

    return (
        <div id="stat_cate" className="nso_cate_body">
            <div className="nso_tab_content">
                <div className="__table_desktop">
                    <div className="__sector_list">
                        <span className="__sector_header">
                            {sectors_list.find((e) => e.type === type)?.mnName}
                        </span>
                        <div className="__table">
                            {/* PrimeReact DataTable */}
                            <DataTable
                                value={menuItems.slice(pagination.first, pagination.first + pagination.rows)}
                                loading={loading}
                                paginator={false} // We use external paginator
                            >
                                <Column
                                    body={(item) => (
                                        <div className="__file_table">
                                            {/* Conditional Link or Clickable Div */}
                                            {getCheckItemExtension(item, "pdf") ? (
                                                <Link href={`/view/${item.id}`} className="_file_name">
                                                    {item.name}
                                                </Link>
                                            ) : (
                                                <div className="_file_name" onClick={() => onDownloadDirect(item.file_info)}>
                                                    {item.name}
                                                </div>
                                            )}

                                            <div className="_file_info">{item.info}</div>

                                            {/* Footer Section */}
                                            <div className="__file_table_foot">
                                                <div className="_file_publishedDate">
                                                    {new Date(item.published_date).toISOString().split("T")[0]}
                                                </div>
                                                <div className="_file_view">
                                                    <i className="pi pi-eye"></i> {item.views.toLocaleString()}
                                                </div>
                                                <div className="_file_type">
                                                    <span>{getExtension(item.file_info)}</span>
                                                </div>
                                                <div className="_file_size">
                                                    {lng === "mn" ? "Файлын хэмжээ:" : "File Size:"} {(item.file_size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </DataTable>

                            {/* Custom Pagination */}
                            <div className="__pagination">
                                <span>
                                    {lng === "mn" ? "Нийт:" : "A total of:"} <strong>{pagination.total}</strong>
                                </span>
                                <Paginator
                                    first={pagination.first}
                                    rows={pagination.rows}
                                    totalRecords={pagination.total}
                                    onPageChange={onPageChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
