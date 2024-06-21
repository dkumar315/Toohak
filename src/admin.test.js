import { setData, getData } from './dataStore';
import isEmail from 'validator/lib/isEmail';
import { 
  adminAuthRegister, adminAuthLogin, 
  adminUserDetails, adminUserDetailsUpdate,
  adminUserPasswordUpdate 
} from './auth.js';
import {
  adminQuizCreate,
  adminQuizList,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate
} from './quiz.js';
import { clear } from './other.js';

let user1 = {
  email: 'alice.user1@yahoo.com',
  password: 'passw0rd',
  nameFirst: 'user',
  nameLast: 'alice',
};

let user2 = {
  email: 'bob.user2@hotmail.com',
  password: 'passw0rd',
  nameFirst: 'user',
  nameLast: 'bob',
};

let user3 = {
  email: 'charlie.user3@outlook.com',
  password: 'passw0rd',
  nameFirst: 'user',
  nameLast: 'charlie',
};

let user4 = {
  email: 'diana.user4@aol.com',
  password: 'passw0rd',
  nameFirst: 'user',
  nameLast: 'diana',
};

let user5 = {
  email: 'emma.user5@icloud.com',
  password: 'passw0rd',
  nameFirst: 'user',
  nameLast: 'emma',
};

let user6 = {
  email: 'frank.user6@mail.com',
  password: 'passw0rd',
  nameFirst: 'user',
  nameLast: 'frank',
};

let user7 = {
  email: 'grace.user7@protonmail.com',
  password: 'passw0rd',
  nameFirst: 'user',
  nameLast: 'grace',
};

let users = [
  user1,
  user2,
  user3,
  user4,
  user5,
  user6,
  user7
];

clear();

const quizName = 'Quiz';
const description = 'this is a description';
const longQuizDescription = 'v'.repeat(101);

  describe('adminAuthRegister', () => {
    users.forEach((user, index) => {
      const res = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
      users[index].authUserId = res.authUserId;
      test(`adminAuthRegister user${index}`, () => {
        expect(res).toMatchObject({ authUserId: expect.any(Number) });
      });
    });
  });

  describe('adminUserDetails', () => {
    users.forEach((user, index) => {
      test(`user${index}`, () => {
        const res = adminUserDetails(user.authUserId).user;
        expect(res.userId).toStrictEqual(user.authUserId);
        expect(res.email).toStrictEqual(user.email);
        expect(res.name).toStrictEqual(user.nameFirst + ' ' + user.nameLast);
        expect(res.numSuccessfulLogins).toStrictEqual(0);
        expect(res.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
      });
    });
  });

  describe('adminAuthLogin', () => {
    users.forEach((user, index) => {
      test(`user${index}`, () => {
        let res = adminAuthLogin(user.email, user.password);
        expect(res).toMatchObject({ authUserId: user.authUserId });

        res = adminUserDetails(user.authUserId).user;
        expect(res.userId).toStrictEqual(user.authUserId);
        expect(res.email).toStrictEqual(user.email);
        expect(res.name).toStrictEqual(user.nameFirst + ' ' + user.nameLast);
        expect(res.numSuccessfulLogins).toStrictEqual(1);
        expect(res.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
      });
    });
  });

  describe('adminUserDetailsUpdate', () => {
    users.forEach((user, index) => {
      test(`user${index}`, () => {
        users[index].nameFirst = user.nameFirst + 'Update';
        let res = adminUserDetailsUpdate(user.authUserId, user.email, user.nameFirst, user.nameLast);
        expect(res).toMatchObject({});

        res = adminUserDetails(user.authUserId).user;
        expect(res.userId).toStrictEqual(user.authUserId);
        expect(res.email).toStrictEqual(user.email);
        expect(res.name).toStrictEqual(user.nameFirst + ' ' + user.nameLast);
        expect(res.numSuccessfulLogins).toStrictEqual(1);
        expect(res.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
      });
    });

    describe('adminUserPasswordUpdate', () => {
    users.forEach((user, index) => {
      test(`user${index}`, () => {
        const oldPassword = user.password;
        const newPassword = oldPassword + 'Update';
        let res = adminUserPasswordUpdate(user.authUserId, oldPassword, newPassword);
        users[index].password = newPassword;
        expect(res).toMatchObject({});

        res = adminAuthLogin(user.email, user.password);
        expect(res).toMatchObject({ authUserId: user.authUserId });

        res = adminUserDetails(user.authUserId).user;
        expect(res.userId).toStrictEqual(user.authUserId);
        expect(res.email).toStrictEqual(user.email);
        expect(res.name).toStrictEqual(user.nameFirst + ' ' + user.nameLast);
        expect(res.numSuccessfulLogins).toStrictEqual(2);
        expect(res.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
      });
    });
  });


  describe('adminQuizList - empty', () => {
    users.forEach((user, index) => {
      test(`user${index}`, () => {
        let res = adminQuizList(user.authUserId);
        expect(res).toMatchObject({ quizzes: [] });
      });
    });
  });

  describe('adminQuizCreate', () => {
    users.forEach((user, index) => {
      test(`adminQuizCreate user${index}`, () => {
        let res = adminQuizCreate(user.authUserId, quizName, description);
        expect(res).toMatchObject({ quizId: expect.any(Number) });
      });

      test(`adminQuizList user${index}`, () => {
        let res = adminQuizList(user.authUserId);
        expect(res.quizzes).toMatchObject([{ quizId: index + 1, name: quizName, }]);
      });
    });
console.log(getData());
    describe('adminQuizRemove', () => {
      users.forEach((user, index) => {
        test(`adminQuizRemove user${index}`, () => {
          let res = adminQuizRemove(user.authUserId, index + 1);
          expect(res).toMatchObject({});
        });

        test(`adminQuizList user${index}`, () => {
          let res = adminQuizList(user.authUserId);
          expect(res.quizzes).toMatchObject([]);
        });
      });
    });
  });


});
