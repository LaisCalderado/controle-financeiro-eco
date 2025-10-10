export const registerUser = async (data: { name: string, email: string, password: string }) => {
    const res = await fetch('https://controle-financeiro-eco-back.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
};
