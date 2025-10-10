import React from 'react';
import '../styles/components/_alert.scss';

interface AlertProps {
    type: 'success' | 'error';
    message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
    return <div className={`alert ${type}`}>{message}</div>;
};
