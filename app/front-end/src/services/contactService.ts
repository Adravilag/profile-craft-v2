import { API } from './http';
import { debugLog } from '@/utils/debugConfig';

type ContactData = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

const contactService = {
  sendMessage: async (data: ContactData) => {
    debugLog.api('\ud83d\udce8 Enviando mensaje de contacto desde frontend', data.email);
    const resp = await API.post('/contact', data);
    return resp.data;
  },
};

export default contactService;
