import React, { useState } from 'react';
import './DataTable.css';
import classNames from 'classnames';

export const DataTable = ({columns, data}) => {
  return (
    <table className = 'table'>
      <thead className = 'table__head'>
        <tr>
          {columns.map((header, index) => (
              <th 
                key={index} 
                className = 'table__header table__cell'
                title = {header.rule}
              > 
                {header.name} 
              </th>
          ))}
        </tr>
      </thead>
      <tbody className = 'table__body'>
        {data.map((user, index) => (
          <tr key = {index}>
            {user.map((userData, i) => (
              <td 
                key={i}
                className = {classNames(
                  'table__cell', {
                    'table__cell-invalid': !userData.validation
                  }
                )}
              >
                {userData.value}
              </td>
            ))}
          </tr>  
        ))}
      </tbody>
    </table>
  );
}