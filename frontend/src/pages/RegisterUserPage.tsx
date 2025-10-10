import React from 'react';
import RegisterUserForm from '../components/forms/RegisterUserForm';

const RegisterUserPage: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Cadastrar Novo Usuário</h1>
      </div>
      <RegisterUserForm />
    </div>
  );
};

export default RegisterUserPage;
