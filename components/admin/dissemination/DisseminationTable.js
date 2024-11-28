import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function DisseminationTable({ 
    data, 
    loading, 
    onEdit, 
    onDelete,
    languageBodyTemplate,
    statusBodyTemplate,
    dateBodyTemplate 
}) {
    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(rowData.id);
                    }}
                    className="mr-2 px-2 py-1 text-xs text-white rounded-full bg-gray-5 hover:bg-gray-6"
                >
                    <i className="pi pi-pencil"></i>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(rowData.id);
                    }}
                    className="px-2 py-1 text-xs text-white rounded-full bg-red-100 hover:bg-red-500"
                >
                    <i className="pi pi-trash"></i>
                </button>
            </>
        );
    };

    return (
        <DataTable
            value={data}
            dataKey="id"
            paginator
            rows={15}
            loading={loading}
            rowsPerPageOptions={[15]}
            className="p-datatable-sm"
            emptyMessage="No articles found."
            currentPageReportTemplate="Нийт {totalRecords} мэдээллээс {first}-{last}"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        >
            <Column 
                header="#" 
                body={indexBodyTemplate} 
                style={{ width: '3rem' }} 
            />
            <Column 
                field="name" 
                header="Гарчиг" 
                sortable 
                style={{ maxWidth: '400px', whiteSpace: 'normal' }}
                body={(rowData) => (
                    <div className="whitespace-normal line-clamp-2" title={rowData.name}>
                        {rowData.name}
                    </div>
                )}
            />
            <Column 
                field="language" 
                header="Хэл" 
                body={languageBodyTemplate} 
                style={{ width: '5rem' }} 
            />
            <Column 
                field="published_date" 
                header="Огноо" 
                body={(rowData) => dateBodyTemplate(rowData, 'published_date')} 
                sortable 
            />
            <Column 
                field="published" 
                header="Төлөв" 
                body={statusBodyTemplate} 
                style={{ width: '7rem' }} 
                sortable 
            />
            <Column 
                header="Үйлдэл" 
                body={actionBodyTemplate} 
                style={{ width: '8rem' }} 
            />
        </DataTable>
    );
} 