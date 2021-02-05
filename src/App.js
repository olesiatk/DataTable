import './App.css';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import DataTable from 'react-data-table-component';
 
function App() {
 
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [errorFileFormat, setErrorFileFormat] = useState(false);
 
  // process CSV data
  const processData = dataString => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

    const headersCheckLower = headers.map(head => head.toLowerCase());
    if (headersCheckLower.includes('email') 
        && headersCheckLower.includes('phone')
        && headersCheckLower.includes('full name')){
      setErrorFileFormat(false)
    } else {
      setErrorFileFormat(true)
      console.log ('bad');
    }
 
    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] === '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }
 
        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    }
 
    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c,
    }));
 
    setData(list);
    setColumns(columns);
  }
 
  // handle file upload
  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {

        console.log("ok");
    
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);

    reader.onerror = function() {
      console.log('error');
    };
  }

  const hiddenFileInput = React.useRef(null);
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div>
      <header className="App-header">
        <p> DataTable </p>
      </header>
      <>
        <button onClick={handleClick}>
          Import users
        </button>
        <input
          type="file"
          style={{display:'none'}}
          ref={hiddenFileInput}
          accept=".csv"
          onChange={handleFileUpload}
        />
      </>
      {errorFileFormat ? 'File format is not correct': (
        <DataTable
          pagination
          highlightOnHover
          columns={columns}
          data={data}
        />
      )}
    </div>
  );
}

export default App;
