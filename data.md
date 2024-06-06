```javascript
let data = {
  // TODO: insert your data structure that contains 
  // users + quizzes here
  users: [
    {
      userId: 1, 														// number, or authuserId
      nameFirst: 'string',
      nameLast: 'string',
      email: 'string@gmail.com',
      password: 'string',
      numSuccessfulLogins: 0, 							// number, dafault 0
      numFailedPasswordsSinceLastLogin: 0 	// number, default 0
    },
    {
      userId: 2,
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      email: 'hayden.smith@unsw.edu.au',
      password: 'haydensmith',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1
    },
  ],
  quizzes: [
    {
      quizId: 1,
      quizName: 'Quiz 1',
      quizDescription: 'Quiz on Javascript',
      quizCreator: 1,
      questions: [
        {
          questionId: 1,
          questionString: 'What is Node.js?',
          answers: [
            {
              answerId: 1,
              answerString: 'An IDE',
            },
          ],
          options: [
            {
              optionId: 1,
              optionString: 'An IDE',
            },
          ],
        },
      ],
    },
    {
      quizId: 1,
      quizName: 'Quiz 2',
      quizDescription: 'Quiz on Typescript',
      quizCreator: 2,
      questions: [
        {
          questionId: 1,
          questionString: 'List the advantages of Typescript.',
          answers: [
            {
              answerId: 1,
              answerString: 'Can run on any browser',
            },
          ],
          options: [
            {
              optionId: 1,
              optionString: 'Can run on any browser',
            },
          ],
        },
      ],
    },
  ],
}
```

[Optional] short description: 
