import React from 'react';
import './DataTable.css';
import classNames from 'classnames';
import PropTypes from 'prop-types';

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

DataTable.propTypes = {
  column: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    rule: PropTypes.string,
  })),
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    validation: PropTypes.bool.isRequired,
  })))
};