import React from "react";

type LabelWithValueProps = {
  label?: React.ReactNode;
  value?: React.ReactNode;
};

const LabelWithValue = ({ label, value }: LabelWithValueProps) => (
  <div className="space-x-4">
    <span className="label">{label}</span>
    {value ? <span className="value">{value}</span> : null}
  </div>
);

export default LabelWithValue;
