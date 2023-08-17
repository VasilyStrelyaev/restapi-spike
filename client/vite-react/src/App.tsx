import React, { useState, useMemo } from 'react';
import './App.css';
import {
  DataGrid, Column, Scrolling
} from 'devextreme-react/data-grid';

import CustomStore from 'devextreme/data/custom_store';
import { UserStatsRow, ReactionStats } from './types';
import { User, Post, Reaction, ReactionType } from './../../../types';

const BASE_URL = 'http://localhost:3005';
const USERS_URL = `${BASE_URL}/users`;
const getUserUrlPrefix = (userId: string) => `${BASE_URL}/user/${userId}`;
const getUserPostsUrl = (userId: string) => `${getUserUrlPrefix(userId)}/posts`;
const getUserReactionsUrl = (userId: string) => `${getUserUrlPrefix(userId)}/reactions`;

const fetchData: <T>(url: string) => Promise<T[]> = async (url) => {
  const response = await fetch(url);

  return response.ok ? response.json() as Promise<any[]> : [];
};

const prepareDataSource = async () => {
  const users: User[] = await fetchData<User>(USERS_URL);

  const dataSource: UserStatsRow[] = await Promise.all(users.map<Promise<UserStatsRow>>(async user => {
    let posts = await fetchData<Post>(getUserPostsUrl(user.ID));

    posts = posts.filter(post => {
      const postedAt = new Date(post.PostedAt);
      const now = new Date();

      const msPerDay = 1000 * 60 * 60 * 24;
      const postAge = (now.getTime() - postedAt.getTime()) / msPerDay;

      return postAge <= 30;
    });

    const reactions = await fetchData<Reaction>(getUserReactionsUrl(user.ID));

    const reactionStats = reactions.reduce<ReactionStats>((acc, reaction) => {
      acc[reaction.ReactionType]++;

      return acc;
    }, { smile: 0, heart: 0, fire: 0, crying: 0 });

    const sortedReactionStats = Object.entries(reactionStats).sort((stat1, stat2) => stat1[1] - stat2[1]);

    return {
      userId: user.ID,
      publicName: user.PublicName,
      postCountLastMonth: posts.length,
      favoriteReaction: sortedReactionStats[sortedReactionStats.length - 1][0] as ReactionType
    };
  }));

  return dataSource;
};

export default function App() {
  const [dataLoadDuration, setDataLoadDuration] = useState<number | undefined>(void 0);
  const [dataSourceLength, setDataSourceLength] = useState<number | undefined>(void 0);

  const userStatsData = useMemo(() => new CustomStore<UserStatsRow, string>({
    key: 'userId',
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
        dataSource={userStatsData}
        repaintChangesOnly={true}
      >
        <Scrolling
          mode="virtual"
        />

        <Column dataField="publicName" dataType="string">
        </Column>

        <Column dataField="postCountLastMonth" dataType="number">
        </Column>

        <Column dataField="favoriteReaction" dataType="string">
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
