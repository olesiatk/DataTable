import React, { useState } from 'react';
import './App.css';
import { DataTable } from './components/DataTable'
 
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

    //set innitial dates
    const tableBody = tableDataString.slice(1)
      .map((user, i) => (`${i+1}; `+user+'; ').split(/;(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/)
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

    function checkHasChildren(hasChildren) {
      return (hasChildren.toLowerCase() ==='true'
              || hasChildren.toLowerCase() ==='false'
              || hasChildren ===''
            ) 
              ? true
              : false;
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
          userData.validation = checkHasChildren(userData.value);
          if (userData.value === '') {
            userData.value = 'FALSE';
          }
          break;
        case ('license states'):
          // check if it isn't number
          userData.validation = !/\d/.test(userData.value);
          if (userData.value) {
            userData.value = userData.value.replace(',', '|').split('|').map(state => state.trim().slice(0,2).toUpperCase()).join(' | ');
          }
          break;
        case ('expiration date'):
          userData.validation = Date.parse(userData.value) 
            && new Date(userData.value)<=new Date()
            && (userData.value.includes('/') || userData.value.includes('-'));
          break;
        case ('license number'):
          userData.validation = userData.value.length === 6 && /^[a-zA-Z\d]*$/.test(userData.value)
          break;
        default:
          break;
      }
      return userData;
    }));

    // set data with check unique Phone and Email
    const usersDataWithCheckUnique = usersData.map((user, i) => user.map((userData, iDate) => {
      if (userData.name.toLowerCase() === 'phone') {
        const dublicateData = tableBody
          .find((user, n) => n !== i 
            && user
              .find(userDataCheck => userDataCheck.name === userData.name 
                && userDataCheck.value === userData.value
              )
          );
        if (dublicateData) {
          user[user.length-1].value = dublicateData[0].value;
          userData.validation = false;
        }
      }
      if (userData.name.toLowerCase() === 'email') {
        const dublicateData = tableBody
          .find((user, n) => n !== i 
            && user
              .find(userDataCheck => userDataCheck.name === userData.name 
                && userDataCheck.value.toLowerCase() === userData.value.toLowerCase()
              )
          );
        if (dublicateData) {
          user[user.length-1].value = dublicateData[0].value;
          userData.validation = false;
        }
      }
      return userData;
    }));

    // set headers
    const headers = tableHead.map(header => ({
      name: header.trim(),
      rule: setRules(header)
    }));

    //function for define collumns rules
    function setRules(header) {
      switch (header.toLowerCase()) {
        case ('phone'):
          return 'should be unique and in format +1хххххххххх';
        case ('email'):
          return 'should be unique'
        case ('age'):
          return 'should be not less then 21'
        case ('experience'):
          return 'should be not more then age'
        case ('yearly income'):
          return 'should be integer or decimal and less 1000000'
        case ('has children'):
          return 'should be "true" or "false"'
        case ('license states'):
          return 'should be name of states (can be devide with "|")'
        case ('expiration date'):
          return 'should be in format YYYY-MM-DD or MM-DD-YYYY'
        case ('license number'):
          return 'should have 6 symbols (numbers or letters)'
        case ('dublicate with'):
            return 'phone or email this user is repeated with the current user'
        default:
            return '';
      }
    }

    // set state
    setData(usersDataWithCheckUnique);
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
          className = 'App__button'
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
      {errorFileFormat 
        ? (
          <div className = "App__message">File format is not correct</div>
        ): (
          <DataTable 
            columns = {columns}
            data = {data}
          />
        )
      }
    </div>
  );
}

export default App;
