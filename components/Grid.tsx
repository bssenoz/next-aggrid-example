'use client';

import React from 'react';
import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-balham.css';
import {
  GridReadyEvent,
  GridApi,
  Column,
  ColDef,
} from 'ag-grid-community';
import { fetchData, Athlete } from '../data/api';
import { FaMedal, FaTrash, FaFileCsv } from 'react-icons/fa';
import { themeQuartz, colorSchemeDark, iconSetMaterial } from 'ag-grid-community';;

const columnDefs: ColDef[] = [
  {
    headerName: '',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
  },
  { headerName: 'ID',      field: 'id',      width: 80,  sortable: true },
  { headerName: 'Athlete', field: 'athlete', width: 150, editable: true, sortable: true, filter: true },
  { headerName: 'Age',     field: 'age',     width: 90,  minWidth: 50, maxWidth: 100, editable: true, sortable: true, filter: true },
  { headerName: 'Country', field: 'country', width: 120, sortable: true, filter: true, type: 'rightAligned' },
  { headerName: 'Year',    field: 'year',    width: 90,  sortable: true, filter: true },
  { headerName: 'Date',    field: 'date',    width: 110, sortable: true, filter: true },
  { headerName: 'Sport',   field: 'sport',   width: 110, sortable: true, filter: true },
  {
    headerName: 'Gold',
    field: 'gold',
    width: 100,
    sortable: true,
    filter: true,
    cellClassRules: {
      'bg-yellow-100 text-yellow-800': 'x > 2',
    },
  },
  { headerName: 'Silver',  field: 'silver',  width: 100, sortable: true, filter: true },
  { headerName: 'Bronze',  field: 'bronze',  width: 100, sortable: true, filter: true },
  {
    headerName: 'Total',
    field: 'total',
    width: 100,
    sortable: true,
    filter: true,
    cellRenderer: (params: { value: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
      <span className="flex items-center gap-1 justify-center">
        <FaMedal className="text-blue-500" /> {params.value}
      </span>
    ),
  },
];

type AgGridApi = {
  grid?: GridApi;
  column?: Column;
};


    
export default function Grid() {
  const [rowData, setRowData] = React.useState<Athlete[]>([]);
  const apiRef = React.useRef<AgGridApi>({});
  const [selectedCount, setSelectedCount] = React.useState(0);
  const gridApi = React.useRef<GridApi | null>(null);
  const columnApi = React.useRef<Column | null>(null);
  
  React.useEffect(() => {
    fetchData().then(setRowData);
  }, []);

  const myTheme = themeQuartz.withParams({
    backgroundColor: '#f9fafb',                // grid arka planı 
    foregroundColor: '#374151',                // yazı rengi
    headerTextColor: '#ffffff',                // başlık yazısı
    headerBackgroundColor: '#7398eb',          // başlık arka planı
    oddRowBackgroundColor: '#f3f4f6',           // zebra efekti için
    headerColumnResizeHandleColor: '#93c5fd',  // resize çizgisi
  });
  

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    columnApi.current = (params as any).columnApi;
  
    apiRef.current.grid = params.api;
    apiRef.current.column = (params as any).columnApi;
  };

  const onSelectionChanged = () => {
    setSelectedCount(gridApi.current?.getSelectedRows().length || 0);
  };

  const deleteSelected = () => {
    const selected = gridApi.current?.getSelectedRows() || [];
    if (!selected.length) return alert('Lütfen önce satır seçin.');
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
      <span className="ml-auto text-sm text-gray-500">{selectedCount} satır seçili</span>
    </div>

    {/* AG Grid Table */}
    <div className="ag-theme-balham flex-1 w-full">
      <AgGridReact 
        theme={myTheme}
        rowSelection="multiple"
        suppressRowClickSelection={true}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onSelectionChanged={onSelectionChanged}
        rowData={rowData}
        animateRows={true}
        pagination={true}
        paginationPageSize={20}
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
          floatingFilter: true,
        }}
      />
    </div>
  </div>

  );
}
