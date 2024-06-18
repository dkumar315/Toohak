```javascript
let data = {
  users: [
    {
      // authuserId: number
      userId: 1,
      nameFirst: 'string',
      nameLast: 'string',
      email: 'string@gmail.com',
      password: 'string',
      numSuccessfulLogins: 0,
      numFailedPasswordsSinceLastLogin: 0
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
      name: 'Quiz 1',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'Quiz on Javascript',
      creatorId: 1,
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
      name: 'Quiz 2',
      timeCreated: 1683125871,
  		timeLastEdited: 1683125872,
      description: 'Quiz on Typescript',
      creatorId: 2,
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

- Details the format in which the data is stored. 
- We assume that anything besides the admin entity and its related attributes are out of scope of this project.
- We added quizCreator and questions fields to emulate real life online quizzing tools.
