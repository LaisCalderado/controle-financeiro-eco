export const registerUser = async (data: { name: string, email: string, password: string }) => {
    const res = await fetch('http://localhost:3333/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
};
