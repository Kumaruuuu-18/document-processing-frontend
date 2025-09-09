import React from 'react'

const ScoreBadgeTextArea = ({
  label,
  score,
  value,
  onChange,
  placeholder
}) => {  // ← Make sure you have the arrow => here
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center">
        <label className="font-medium">{label}</label>
        <span className="text-yellow-600 font-bold text-lg">{(score * 100).toFixed(2)}%</span>
      </div>
      <textarea
        className="mt-1 w-full border rounded-lg p-2 text-gray-900"
        rows={2}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default ScoreBadgeTextArea
