import React from 'react';
import '../styles/components/_input.scss';

interface InputProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => (
    <div className="input-group">
        <label>{label}</label>
        <input {...props} />
    </div>
);
