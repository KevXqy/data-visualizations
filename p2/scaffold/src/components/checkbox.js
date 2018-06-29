import React from 'react';
class Checkbox extends React.Component {
  render() {
    const {label, onClick, checked, color} = this.props;
    return (
      <div className="flex checkbox">
        <input
          type="checkbox"
          value={checked}
          onClick={() => onClick(label)}
          defaultChecked
          />
        <span style={{borderBottom: `6px solid ${color}`}}>{label}</span>
      </div>
    );
  }
}
Checkbox.displayName = 'Checkbox';
export default Checkbox;
