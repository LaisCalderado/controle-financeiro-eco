// src/App.tsx
import React from 'react';
import RegisterForm from './components/forms/RegisterForm';
import UserList from './components/UserList';

const App: React.FC = () => {
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Controle Financeiro</h1>
      <RegisterForm />
      <UserList />
    </div>
  );
};

export default App;
