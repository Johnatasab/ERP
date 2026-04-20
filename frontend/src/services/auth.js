import api from './api';

//Base URL da API (backend)
const API_URL = 'http://localhost:3000/api/auth';

//Função de registro
export const register = async (name, email, password) => {
    //Envia um POST para / register com os dados
    const response = await api.post(`${API_URL}/register`, {name, email, password});
    return response.data; //Retorna {message, user}
};

//Função de login
export const login = async (email, password) => {
    const response = await api.post('/auth/login', {email, password});
    //Se o login for bem-sucedido, guarda o token e os dados do user no localStorage
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data; //Retorna {message, token, user}
};

//Função para fazer logout
export const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

//Função para obter o token guardado
export const getToken = () => {
    return localStorage.getItem('token');
};

//Função para verificar se o utilizador está autenticado 
export const isAuthenticated = () => {
    return !!getToken(); // !! Converte para booleano: se existe token, true
};

//Função para obter os dados do user guardado
export const getUser = () =>{
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
;}