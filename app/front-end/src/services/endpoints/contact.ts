import contactService from '../contactService';

type ContactData = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

/**
 * Envía un mensaje de contacto al backend.
 * @param data Objeto con { name, email, subject?, message }
 */
export const sendContactMessage = (data: ContactData) => contactService.sendMessage(data);

export default { sendContactMessage };
