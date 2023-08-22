import React, { useState, useMemo } from 'react';
import './App.css';
import {
  DataGrid, Column, Scrolling
} from 'devextreme-react/data-grid';

import CustomStore from 'devextreme/data/custom_store';
import { ContactStatsRow } from './types';
import { Contact, Task, Message } from './../../../types';

const BASE_URL = 'http://localhost:3005';
const CONTACTS_URL = `${BASE_URL}/contacts`;
const getContactUrlPrefix = (contactId: number) => `${BASE_URL}/contact/${contactId}`;
const getContactTasksUrl = (contactId: number) => `${getContactUrlPrefix(contactId)}/tasks`;
const getContactMessagesUrl = (contactId: number) => `${getContactUrlPrefix(contactId)}/messages`;

const fetchData: <T>(url: string) => Promise<T[]> = async (url) => {
  const response = await fetch(url);

  return response.ok ? response.json() as Promise<any[]> : [];
};

const prepareDataSource = async () => {
  const contacts: Contact[] = await fetchData<Contact>(CONTACTS_URL);

  const dataSource: ContactStatsRow[] = await Promise.all(contacts.map<Promise<ContactStatsRow>>(async contact => {
    let messages = await fetchData<Message>(getContactMessagesUrl(contact.id));

    messages = messages.filter(message => {
      const createdAt = new Date(message.date);
      const now = new Date();

      const msPerDay = 1000 * 60 * 60 * 24;
      const messageAge = (now.getTime() - createdAt.getTime()) / msPerDay;

      return messageAge <= 30;
    });

    const tasks = await fetchData<Task>(getContactTasksUrl(contact.id));

    return {
      contactId: contact.id,
      name: contact.name,
      messageCountLastMonth: messages.length,
      openTasks: tasks.filter(task => task.status === 'Open').length
    };
  }));

  return dataSource;
};

export default function App() {
  const [dataLoadDuration, setDataLoadDuration] = useState<number | undefined>(void 0);
  const [dataSourceLength, setDataSourceLength] = useState<number | undefined>(void 0);

  const contactStatsData = useMemo(() => new CustomStore<ContactStatsRow, string>({
    key: 'contactId',
    load: async () => {
      const dataLoadStarted = Date.now();

      const dataSource = await prepareDataSource();

      setDataLoadDuration(Date.now() - dataLoadStarted);
      setDataSourceLength(dataSource.length);

      return dataSource;
    }
  }), [setDataLoadDuration, setDataSourceLength]);

  return (
    <React.Fragment>
      <DataGrid
        id="grid"
        showBorders={true}
        dataSource={contactStatsData}
        repaintChangesOnly={true}
      >
        <Scrolling
          mode="virtual"
        />

        <Column dataField="name" dataType="string">
        </Column>

        <Column dataField="messageCountLastMonth" dataType="number">
        </Column>

        <Column dataField="openTasks" dataType="number">
        </Column>
      </DataGrid>
      { dataLoadDuration &&
        <div>
          <h2>REST API</h2>
          <div>{`${dataSourceLength} rows loaded in ${dataLoadDuration} milliseconds`}</div>
        </div>
      }
    </React.Fragment>
  );
}
