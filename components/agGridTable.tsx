'use client';

import React, { useCallback, useRef } from 'react';
import { LicenseManager, ModuleRegistry, AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent, GridApi, Column, ColDef, ColGroupDef } from 'ag-grid-community';
import { FaMedal, FaTrash, FaFileCsv } from 'react-icons/fa';
import { themeQuartz } from 'ag-grid-community';
import SliderFloatingFilter from "./sliderFloatingFilter";
import { fetchData } from '../store/athleteStore';
import { Athlete } from '../types/athlete';

ModuleRegistry.registerModules([AllEnterpriseModule]);
LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY ?? "");

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: '',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    rowDrag: true,
  },
  { headerName: 'ID', field: 'id', width: 80, sortable: true, pinned: 'left' },
  {
    headerName: 'Country',
    field: 'country',
    width: 120,
    sortable: true,
    filter: 'agSetColumnFilter',
    rowGroup: true,
    hide: true,
  },
  {
    headerName: 'Year',
    field: 'year',
    width: 90,
    sortable: true,
    filter: 'agNumberColumnFilter',
    rowGroup: true,
    hide: true,
  },
  {
    headerName: 'Sporcu Bilgileri',
    children: [
      {
        headerName: 'Athlete',
        field: 'athlete',
        width: 150,
        editable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellStyle: { fontWeight: 'bold' },
        headerClass: 'custom-header-athlete',
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: { maxLength: 100 },
        pivot: true,
      },
      {
        headerName: 'Age',
        field: 'age',
        width: 150,
        minWidth: 50,
        maxWidth: 150,
        editable: true,
        sortable: true,
        filter: 'agNumberColumnFilter',
        floatingFilterComponent: SliderFloatingFilter,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: Array.from({ length: 100 }, (_, i) => i + 1),
          valueListMaxHeight: 120,
          valueListMaxWidth: 200,
        },
      },
    ],
  },
  {
    headerName: 'Olimpiyat Detayları',
    children: [
      {
        headerName: 'Date',
        field: 'date',
        width: 200,
        sortable: true,
        filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Sport',
        field: 'sport',
        width: 110,
        sortable: true,
        filter: 'agTextColumnFilter',
      },
    ],
  },
  {
    headerName: 'Madalya Bilgileri',
    children: [
      {
        headerName: 'Gold',
        field: 'gold',
        width: 100,
        sortable: true,
        filter: 'agNumberColumnFilter',
        columnGroupShow: 'open',
        cellClassRules: {
          'bg-yellow-100 text-yellow-800': 'x > 2',
        },
      },
      {
        headerName: 'Silver',
        field: 'silver',
        width: 100,
        sortable: true,
        filter: 'agNumberColumnFilter',
        columnGroupShow: 'open',
      },
      {
        headerName: 'Bronze',
        field: 'bronze',
        width: 100,
        sortable: true,
        filter: 'agNumberColumnFilter',
        columnGroupShow: 'open',
      },
      {
        headerName: 'Total',
        field: 'total',
        width: 100,
        sortable: true,
        filter: 'agNumberColumnFilter',
        columnGroupShow: 'closed',
        pivot: true,

        cellRenderer: (params: { value: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
          
     
          (params.value) ?      <span className="flex items-center gap-1 justify-center" >
          <FaMedal className="text-blue-500" /> {params.value}
        </span>
        : null
        ),
      },
    ],
  },
];

function formatNumber(number: number) {
  return Math.floor(number).toLocaleString();
}

export default function Grid() {
  const [rowData, setRowData] = React.useState<Athlete[]>([]);
  const gridRef = useRef<AgGridReact>(null);
  const [selectedCount, setSelectedCount] = React.useState(0);
  const gridApi = useRef<GridApi | null>(null);
  const columnApi = useRef<Column | null>(null);

  React.useEffect(() => {
    fetchData().then(setRowData);
  }, []);

  const myTheme = themeQuartz.withParams({
    backgroundColor: '#f9fafb',
    foregroundColor: '#374151',
    headerTextColor: '#ffffff',
    headerBackgroundColor: '#7398eb',
    oddRowBackgroundColor: '#f3f4f6',
    headerColumnResizeHandleColor: '#93c5fd',
  });

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    columnApi.current = (params as any).columnApi;
    if (gridRef.current) {
      gridRef.current.api.setGridOption("rowSelection", {
        mode: "multiRow",
        groupSelects: "descendants",
      });
    }
  };

  const onSelectionChanged = () => {
    setSelectedCount(gridApi.current?.getSelectedRows().length || 0);
  };

  const getRowHeight = () => 50;

  const deleteSelected = () => {
    const selected = gridApi.current?.getSelectedRows() || [];
    if (!selected || selected.length == 0) return alert('Lütfen önce satır seçin.');
    const ids = new Set(selected.map((r: Athlete) => r.id));
    setRowData((old) => old.filter((r) => !ids.has(r.id)));
    gridApi.current?.deselectAll();
    setSelectedCount(0);
  };

  const exportSelectedCsv = () => {
    const selectedNodes = gridApi.current?.getSelectedNodes();
    if (!selectedNodes?.length) return alert('Lütfen önce satır seçin.');
    gridApi.current!.exportDataAsCsv({
      fileName: 'secili_sporcular.csv',
      onlySelected: true,
    });
  };

  const updateSomeValues = useCallback(() => {
    if (!gridRef.current?.api) return;
    const rowCount = gridRef.current.api.getDisplayedRowCount();
    for (let i = 0; i < 20; i++) {
      const row = Math.floor(Math.random() * rowCount);
      const rowNode = gridRef.current.api.getDisplayedRowAtIndex(row)!;
      const fields = ['gold', 'silver', 'bronze', 'total'];
      const field = fields[Math.floor(Math.random() * fields.length)];
      rowNode.setDataValue(field, Math.floor(Math.random() * 10));
    }
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      <div className="flex gap-3 p-4 border-b bg-white shadow-sm items-center">
        <button
          onClick={deleteSelected}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          <FaTrash /> Sil
        </button>
        <button
          onClick={exportSelectedCsv}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition"
        >
          <FaFileCsv /> CSV İndir
        </button>
        <button
          onClick={updateSomeValues}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Rastgele Güncelle
        </button>
        <span className="ml-auto text-sm text-gray-500">
          {selectedCount} satır seçili
        </span>
      </div>

      <div className="ag-theme-balham flex-1 w-full">
        {columnDefs.length > 0 && rowData.length > 0 && (
          <AgGridReact
            ref={gridRef}
            suppressMoveWhenColumnDragging={true}
            theme={myTheme}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            getRowHeight={getRowHeight}
            rowData={rowData}
            animateRows={true}
            pagination={true}
            paginationPageSize={20}
            rowDragManaged={true}
            rowGroupPanelShow="always"
            groupDefaultExpanded={1}
            autoGroupColumnDef={{
              minWidth: 200,
            }}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              floatingFilter: true,
              enableCellChangeFlash: true,
              cellClass: 'align-right',
              valueFormatter: (params) => {
                if (typeof params.value === 'number') {
                  return formatNumber(params.value);
                }
                return params.value;
              },
            }}
            sideBar={{
              toolPanels: [
                {
                  id: 'columns',
                  labelKey: 'columns',
                  labelDefault: 'Columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
                },
                {
                  id: 'filters',
                  labelKey: 'filters',
                  labelDefault: 'Filtreler',
                  iconKey: 'filter',
                  toolPanel: 'agFiltersToolPanel',
                },
              ],
              defaultToolPanel: '',
            }}
          />
        )}
      </div>
    </div>
  );
}
