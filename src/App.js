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

    //
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
      .map((user, i) => (`${i+1}; `+user+'; ').split(';')
        .map((userData, index) => {
          let userObj = {
            name: tableHead[index],
            value: userData.trim(),
            validation: true,
          }

          //check validation

          return userObj;
        })
      )
        .slice(0,-1);

    // functions for validation (start)
    function checkNumber(number) {
      let x10 = number.slice(-10);
      if (!Number.isInteger(+x10)) {
        return false;
      }
      if (number.length >12 || number.length<10) {
        return false;
      } 
      if (number.length === 12) {
        x10 = number.slice(2);
        if (number.slice(0,2) !== '+1') {
          return false;
        }
      }
      if (number.length === 11) {
        x10 = number.slice(2);
        if (number.slice(0,1) !== '1') {
          return false;
        }
      }
      return true;
    }

    function checkAge(age) {
      if (age < 21 || !Number.isInteger(+age)) {
        return false;
      }
      return true;
    }
    // end functions for validation


    // set date with check validation
    const usersData = tableBody.map((user, i) => user.map((userData, dataIndex) => {
      switch (userData.name.toLowerCase()) {
        case ('phone'):
          userData.validation = checkNumber(userData.value);
          if (userData.validation && userData.value.length===10){
            userData.value = '+1' + userData.value;
          }
          if (userData.validation && userData.value.length===11){
            userData.value = '+' + userData.value;
          }
          break;
        case ('age'):
            userData.validation = checkAge(userData.value);
          break;
        case ('experience'):
            console.log(user[dataIndex-1], userData);
            if (!Number.isInteger(+userData.value) 
                || userData.value < 0 
                || userData.value > user[dataIndex-1].value
              ) {
              userData.validation = false;
            }
          break;
        case ('yearly income'):
          if (isNaN(+userData.value) || +userData.value > 1000000) {
            userData.validation = false;
          } else if (userData.value) {
            userData.value = (Math.round(userData.value * 100)/100).toFixed(2);
          }
          break;
        case ('has children'):
            userData.validation = (userData.value.toLowerCase() ==='true'
              || userData.value.toLowerCase() ==='false'
              || userData.value ===''
            ) 
            ? true
            : false;
            if (userData.value === '') {
              userData.value = 'FALSE';
            }
            break;
        default:
          break;
      }
      return userData;
    }));

    // set data with check unique Phone and Email
    const usersDataCheckUnique = usersData.map((user, i) => user.map((userData, iDate) => {
      if (userData.name.toLowerCase() === 'phone') {
        const dublicateData = tableBody.find((user, n) => n !== i && user.find(userDataCheck => userDataCheck.value === userData.value));
        if (dublicateData) {
          user[user.length-1].value = dublicateData[0].value;
          userData.validation = false;
        }
      }
      if (userData.name.toLowerCase() === 'email') {
        const dublicateData = tableBody.find((user, n) => n !== i && user.find(userDataCheck => userDataCheck.value.toLowerCase() === userData.value.toLowerCase()));
        if (dublicateData) {
          user[user.length-1].value = dublicateData[0].value;
          userData.validation = false;
        }
      }
      return userData;
    }));


    // set headers
    const headers = tableHead.map(header => ({
      name: header,
    }));

    // set state
    setData(usersDataCheckUnique);
    setColumns(headers);
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

  // function for change name of button
  const hiddenFileInput = React.useRef(null);
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  // APP RETURN
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
