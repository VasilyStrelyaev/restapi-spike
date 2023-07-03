import { faker }  from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';
import { User, Post, Reaction, ReactionType } from './types'

type GenerateUserFn = () => User;
type GenerateReactionFn = (post: Post, userIDs: string[]) => Reaction;
type GeneratePostsFn = (userID: string, allUserIDs: string[]) => Post[];
type WriteDataFileFn = (filename: string, data: User[] | Post[] | Reaction[]) => void;

const USER_COUNT = 40;
const POSTS_PER_USER_MIN_COUNT = 15;
const POSTS_PER_USER_MAX_COUNT = 30;
const OLDEST_POST_AGE_DAYS = 90;
const PARAGRAPHS_PER_POST_MIN_COUNT = 4;
const PARAGRAPHS_PER_POST_MAX_COUNT = 8;
const REACTIONS_PER_POST_MIN_COUNT = 10;
const REACTIONS_PER_POST_MAX_COUNT = 20;

const users: User[] = [];
const reactions: Reaction[] = [];

const getRandomArrayElement = <T>(array: T[]) => {
  return array[Math.floor(Math.random() * array.length)];
}

const writeDataFile: WriteDataFileFn = (filename, data) => {
  fs.writeFileSync(path.join('.', 'data', filename), JSON.stringify(data, void 0, 4));
};

const generateUser: GenerateUserFn = () => {
  return {
    ID: uuid(),
    PublicName: faker.person.fullName(),
    Bio: faker.person.bio(),
    PublicLocation: `${faker.location.city()}, ${faker.location.country()}`,
    AvatarURL: faker.image.avatarGitHub()
  };
};

const generateReaction: GenerateReactionFn = (post, userIDs) => {
  return {
    ID: uuid(),
    AuthorID: getRandomArrayElement(userIDs),
    PostID: post.ID,

    LeftAt: faker.date.between({
      from: post.PostedAt,
      to: new Date()
    }).toISOString(),

    ReactionType: getRandomArrayElement<ReactionType>([
      'smile',
      'heart',
      'fire',
      'crying'
    ])
  }
}

const generatePosts: GeneratePostsFn = (userID, allUserIDs) => {
  const postCount = faker.number.int({
    min: POSTS_PER_USER_MIN_COUNT,
    max: POSTS_PER_USER_MAX_COUNT
  });

  const posts: Post[] = [];

  for (let i = 0; i < postCount; i++) {
    const post: Post = {
      ID: uuid(),
      AuthorID: userID,

      PostedAt: faker.date.recent({ 
        days: OLDEST_POST_AGE_DAYS
      }).toISOString(),

      Content: faker.lorem.paragraph({
        min: PARAGRAPHS_PER_POST_MIN_COUNT,
        max: PARAGRAPHS_PER_POST_MAX_COUNT
      })
    };

    const reactionCount = faker.number.int({
      min: REACTIONS_PER_POST_MIN_COUNT,
      max: REACTIONS_PER_POST_MAX_COUNT
    });

    for (let j = 0; j < reactionCount; j++) {
      reactions.push(generateReaction(post, allUserIDs));
    }

    posts.push(post)
  }

  return posts;
}

for (let i = 0; i < USER_COUNT; i++) {
  users.push(generateUser());
}

const userIDs = users.map(user => user.ID);

const posts = users.reduce<Post[]>((acc, user) => {
  acc.push(...generatePosts(user.ID, userIDs));

  return acc;
}, []);

writeDataFile('users.json', users);
writeDataFile('posts.json', posts);
writeDataFile('reactions.json', reactions);
