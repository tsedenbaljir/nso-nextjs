import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function CategoryTable({ 
    data = [], 
    loading = false, 
    onEdit, 
    onDelete 
}) {
    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    const nameTemplate = (rowData) => {
        return <div>{rowData.name}</div>;
    };

    const orderTemplate = (rowData) => {
        return rowData.list_order || '-';
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
            emptyMessage="Ангилал олдсонгүй"
            currentPageReportTemplate="Нийт {totalRecords} ангилалаас {first}-{last}"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            loadingIcon={() => (
                <div className="flex justify-center items-center h-32">
                    <ProgressSpinner 
                        style={{width: '50px', height: '50px'}} 
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
                header="Ангилалын нэр" 
                body={nameTemplate}
                sortable 
            />
            <Column 
                field="list_order" 
                header="Дараалал" 
                body={orderTemplate}
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