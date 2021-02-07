import './App.css';
import React, { useState } from 'react';
 
function App() {
 
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [errorFileFormat, setErrorFileFormat] = useState(false);
 
  // process CSV data
  const processData = dataString => {
    const tableDataString = dataString.split(/\r\n|\n/);
    const tableHead = tableDataString[0].split(';'); 
    tableHead.unshift('ID');
    tableHead.push('Dublicate with');

    const headLowerCase = tableHead.map(header => header.toLowerCase());
    if (headLowerCase.includes('email') 
        && headLowerCase.includes('phone')
        && headLowerCase.includes('full name')){
      setErrorFileFormat(false)
    } else {
      setErrorFileFormat(true)
      console.log ('bad');
    }

    const tableBody = tableDataString.slice(1)
      .map((string, i) => (`${i+1}; `+string+'; ').split(';')
        .map((userData, index) => {
          let userObj = {
            name: tableHead[index],
            value: userData.trim(),
            validation: false,
          }

          //check validation
          switch (userObj.name) {
            case ('Age'):
              if (userObj.value >= 21) {
                userObj.validation = true;
              }
              break;
            default:
              break;
          }
          return userObj;
        })
      )
        .slice(0,-1);

    const columns = tableHead.map(header => ({
      name: header,
    }));
 
    setData(tableBody);
    setColumns(columns);
  }
 
  // handle file upload
  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsText(file);
      reader.onload = () => {
        processData(reader.result);
      };
      reader.onerror = () => {
        console.log(reader.error);
      };
    }
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
        <button 
          title = 'import data in csv format with headers "full name", "phone" and "email"' 
          onClick={handleClick}
        >
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
    
        <table>
          <thead>
            <tr>
              {columns.map((header, index) => (
                  <th key={index} style = {{border: '1px solid black'}}> 
                    {header.name} 
                  </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr key = {index}>
                {user.map((userData, i) => (
                  <td 
                    key={i}
                    style = {{backgroundColor: !userData.validation && 'rgb(244, 204, 204'}}
                  >
                    {userData.value}
                  </td>
                ))}
              </tr>  
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
}

export default App;
