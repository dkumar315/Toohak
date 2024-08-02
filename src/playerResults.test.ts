test('fixme', () => {
  expect(1 + 1).toBe(2);
});
// import { getData, setData } from './dataStore';
// import { requestPlayerResults } from './functionRequest';
// import { OK, BAD_REQUEST } from './dataStore';
// import { Data, States, Colours } from './dataStore';

// const mockData: Data = {
//   users: [],
//   quizzes: [],
//   trashedQuizzes: [],
//   sessions: {
//     tokenCounter: 0,
//     quizCounter: 0,
//     quizSessionCounter: 0,
//     playerCounter: 0,
//     sessionIds: [],
//   },
//   quizSessions: [
//     {
//       sessionId: 1,
//       state: States.FINAL_RESULTS,
//       atQuestion: 0,
//       autoStartNum: 0,
//       metadata: {
//         quizId: 1,
//         name: 'Sample Quiz',
//         timeCreated: Date.now(),
//         timeLastEdited: Date.now(),
//         description: 'A sample quiz',
//         creatorId: 1,
//         numQuestions: 1,
//         duration: 60,
//         thumbnailUrl: 'http://example.com/image.png',
//         questions: [
//           {
//             questionId: 1,
//             question: 'Sample Question',
//             duration: 30,
//             points: 10,
//             answers: [
//               { answerId: 1, answer: 'Answer 1', colour: Colours.RED, correct: true },
//               { answerId: 2, answer: 'Answer 2', colour: Colours.BLUE, correct: false },
//             ],
//             thumbnailUrl: 'http://google.com/img_path.jpg'
//           }
//         ],
//       },
//       messages: [],
//       players: [
//         { playerId: 1, name: 'Player1', points: 10, timeTaken: 5, score: 0 },
//         { playerId: 2, name: 'Player2', points: 20, timeTaken: 5, score: 0 },
//       ],
//       questionSessions: [{
//         questionId: 1,
//         thumbnailUrl: 'http://google.com/img_path.jpg',
//         playersCorrectList: ['Player1'],
//         averageAnswerTime: 5,
//         percentCorrect: 50,
//         playerAnswers: [{
//           playerId: 1,
//           answerIds: [1],
//           correct: true,
//           timeSent: Date.now()
//         },
//         {
//           playerId: 2,
//           answerIds: [1, 2],
//           correct: false,
//           timeSent: Date.now()
//         }
//         ]
//       }]
//     },
//   ],
// };

// beforeEach(() => {
//   setData(mockData);
// });

// describe('Testing quizSessionResult with mock data', () => {
//   const VALID_RESPONSE = {
//     usersRankedByScore: expect.any(Array),
//     questionResults: expect.any(Array),
//   };

//   test.skip('Valid request returns users ranked by score and question results', () => {
//     const playerId = 1;
//     const result = requestPlayerResults(playerId);
//     expect(result).toMatchObject(VALID_RESPONSE);
//     expect(result.status).toStrictEqual(OK);
//   });

//   test('Non-existent playerId', () => {
//     const playerId = 3; // Non-existent playerId
//     const result = requestPlayerResults(playerId);
//     expect(result).toMatchObject({ error: expect.any(String) });
//     expect(result.status).toStrictEqual(BAD_REQUEST);
//   });

//   test('Invalid playerId format', () => {
//     const playerId = -1;
//     const result = requestPlayerResults(playerId);
//     expect(result).toMatchObject({ error: expect.any(String) });
//     expect(result.status).toStrictEqual(BAD_REQUEST);
//   });

//   test('PlayerId as a string', () => {
//     const playerId = 'invalid' as unknown as number;
//     const result = requestPlayerResults(playerId);
//     expect(result).toMatchObject({ error: expect.any(String) });
//     expect(result.status).toStrictEqual(BAD_REQUEST);
//   });

//   test('Session state is not FINAL_RESULTS', () => {
//     const alteredData = getData();
//     alteredData.quizSessions[0].state = States.QUESTION_CLOSE;
//     setData(alteredData);

//     const playerId = 1;
//     const result = requestPlayerResults(playerId);
//     expect(result).toMatchObject({ error: expect.any(String) });
//     expect(result.status).toStrictEqual(BAD_REQUEST);
//   });
// });
