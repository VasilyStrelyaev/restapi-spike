import fs from 'fs';
import path from 'path';
import { faker }  from '@faker-js/faker';

import { Contact, Task, Message, TaskUITG, MessageUITG } from './types';

type WriteDataFileFn = (filename: string, data: Contact[] | Task[] | Message[]) => void;

const OLDEST_MESSAGE_AGE_DAYS = 45;

const fetchData: <T>(url: string) => Promise<T> = async (url) => {
  const response = await fetch(url);

  return response.ok ? response.json() : [];
};

const writeDataFile: WriteDataFileFn = (filename, data) => {
  fs.writeFileSync(path.join('.', 'data', filename), JSON.stringify(data, void 0, 4));
};

const getContacts = () => fetchData<Contact[]>('https://js.devexpress.com/Demos/RwaService/api/Users/Contacts');
const getTasks = async (contactId: number): Promise<TaskUITG[]> => {
  const contactDetails = await fetchData<any>(`https://js.devexpress.com/Demos/RwaService/api/Users/Contacts/${contactId}`);

  return contactDetails.tasks;
};
const getMessages = (contactId: number) => fetchData<MessageUITG[]>(`https://js.devexpress.com/Demos/RwaService/api/Users/Contacts/${contactId}/Messages`);

(async () => {
  const contacts = await getContacts();

  let tasks: Array<Task> = [];
  let messages: Array<Message> = [];

  await Promise.all(contacts.map(async contact => {
    const userTasks = await getTasks(contact.id);
    const userMessages = await getMessages(contact.id);

    tasks = tasks.concat(userTasks.map(task => ({
      ...task,
      contactId: contact.id
    })));
  
    messages = messages.concat(userMessages.map(message => ({
      ...message,

      date: faker.date.recent({ 
        days: OLDEST_MESSAGE_AGE_DAYS
      }).toISOString(),

      contactId: contact.id
    })));
  }, []));

  writeDataFile('contacts.json', contacts);
  writeDataFile('tasks.json', tasks);
  writeDataFile('messages.json', messages);
})();