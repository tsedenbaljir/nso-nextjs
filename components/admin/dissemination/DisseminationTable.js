import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function DisseminationTable({
    data = [],
    loading = false,
    onEdit,
    onDelete
}) {
    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    const languageBodyTemplate = (rowData) => {
        return (
            <img
                src={rowData.language === 'MN' ? '/images/flag_MN.png' : '/images/flag_EN.png'}
                alt={rowData.language}
                className="w-5 h-4"
            />
        );
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <button className={`px-2 py-1 text-xs rounded-md text-white ${rowData.published ? 'bg-emerald-500' : 'bg-yellow-500'
                }`}>
                {rowData.published ? 'Идэвхтэй' : 'Идэвхгүй'}
            </button>
        );
    };

    const dateBodyTemplate = (rowData, field) => {
        try {
            return rowData[field]?.substr(0, 10) || 'Date not available';
        } catch (error) {
            return 'Date not available';
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() =>
                        onEdit(rowData.id)
                    }
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => onDelete(rowData.id)}
                />
            </div>
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
            emptyMessage="Мэдээлэл олдсонгүй"
            currentPageReportTemplate="Нийт {totalRecords} мэдээллээс {first}-{last}"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            loadingIcon={() => (
                <div className="flex justify-center items-center h-32">
                    <ProgressSpinner
                        style={{ width: '50px', height: '50px' }}
                        strokeWidth="4"
                        animationDuration=".5s"
                    />
                </div>
            )}
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