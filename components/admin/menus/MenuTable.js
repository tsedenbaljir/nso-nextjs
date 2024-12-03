import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function MenuTable({
    data = [],
    loading = false,
    onEdit,
    onDelete,
    onAddSubmenu,
    categories = []
}) {
    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    const nameTemplate = (rowData) => {
        return (
            <div>
                <div>{rowData.name_mn || rowData.name}</div>
                <div className="text-sm text-gray-500">{rowData.name_en}</div>
                {/* {rowData.path && (
                    <div className="text-xs text-gray-400 mt-1">
                        <i className="pi pi-folder mr-1"></i>
                        {rowData.path}
                    </div>
                )} */}
            </div>
        );
    };

    const categoryTemplate = (rowData) => {
        const category = categories.find(c => c.id === rowData.category_id);
        return category ? (category.name_mn || category.name) : '-';
    };

    const urlTemplate = (rowData) => {
        return (
            <div className="text-sm text-blue-600">
                {rowData.url || '-'}
            </div>
        );
    };

    const orderTemplate = (rowData) => {
        return rowData.list_order || '-';
    };

    const statusTemplate = (rowData) => {
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${rowData.is_active ?
                    'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {rowData.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
            </span>
        );
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
                    icon="pi pi-plus"
                    rounded
                    outlined
                    severity="info"
                    onClick={() => onAddSubmenu(rowData.id)}
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
            emptyMessage="Цэс олдсонгүй"
            currentPageReportTemplate="Нийт {totalRecords} цэснээс {first}-{last}"
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
                header="Цэсний нэр"
                body={nameTemplate}
                sortable
                style={{ minWidth: '300px' }}
            />
            <Column
                field="url"
                header="URL"
                body={urlTemplate}
                sortable
            />
            <Column
                field="category_id"
                header="Ангилал"
                body={categoryTemplate}
                sortable
            />
            <Column
                field="list_order"
                header="Дараалал"
                body={orderTemplate}
                sortable
                style={{ width: '8rem' }}
            />
            <Column
                field="is_active"
                header="Төлөв"
                body={statusTemplate}
                sortable
                style={{ width: '8rem' }}
            />
            <Column
                header="Үйлдэл"
                body={actionBodyTemplate}
                style={{ width: '12rem' }}
            />
        </DataTable>
    );
} 