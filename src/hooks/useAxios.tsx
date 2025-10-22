import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `https://yummy-go-server.vercel.app/api`,
});

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;