# ShortReport

| Date:                                        | Term2 2024, Week 8 - Week 10, July 14th - August 2nd         |
| -------------------------------------------- | ------------------------------------------------------------ |
| **Team:**                                    | T13B_EGGS, Group ID 583819                                   |
| **Authors:**<br /> (name in ascending order) | **Akshat** Mishra (z5461265), <br />**Devaansh** Kumar(z5474396), <br />**Krish** Patel (z5508882), <br />**Shilpa** Balaji(z5421391), <br />Yuhua(**Victoria**) Zheng (z5411307) |

## OverView

## Table of Contents

[toc]

# Interfaces of iter2 and iter3

exapmle:

![image-20240717204340610](/Users/victoria_mac/Library/Application Support/typora-user-images/image-20240717204340610.png)

## Interfaces

String: token

Integers: 

## adminAuth & aminUser

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:17%">HTTP Method</th>
    <th style="width:25%">Data Types</th>
    <th style="width:32%">Error Returns</th>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/auth/register</code>
      <br /><br />
      <code>adminAuthRegister</code>
      <br /><br />
      Register an admin user
    </td>
    <td>
      POST
      <br /><br />
    </td>
    <td>
      <b>Body Parameters:</b><br />
      <code>{ email, password, nameFirst, nameLast }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ token }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>Email is not in a valid format (400)</li>
        <li>Email is already in use (400)</li>
        <li>Password is less than 8 characters (400)</li>
        <li>nameFirst is an empty string (400)</li>
        <li>nameLast is an empty string (400)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/auth/login</code>
      <br /><br />
      <code>adminAuthLogin</code>
      <br /><br />
      Login an admin user
    </td>
    <td>
      POST
      <br /><br />
    </td>
    <td>
      <b>Body Parameters:</b><br />
      <code>{ email, password }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ token }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>Email does not belong to a user (400)</li>
        <li>Password is not correct for the given email (400)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/auth/logout</code>
      <br /><br />
      <code>adminAuthLogout</code>
      <br /><br />
      Logs out an admin user who has active user session
    </td>
    <td>
      POST
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{}</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>Token is empty (401)</li>
        <li>Token is invalid (401)</li>
      </ul>
    </td>
  </tr>
</table>

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:17%">HTTP Method</th>
    <th style="width:25%">Data Types</th>
	<th style="width:32%">Error Returns</th>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/user/details</code>
      <br /><br />
        <code>adminUserDetails</code>
      <br /><br />
       Get the details of an admin user.
    </td>
    <td>
      GET
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:
      </b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Return Object:
      </b><br />
      <code>{ user }</code>
    </td>
    <td>
	  <b><code>{ error }</code> when any of: </b>
      <ul>
		    <li>token is empty (401),</li> 
        <li>token is invalid (token does not refer to valid logged in user session) (401)</li>
	  </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/user/details</code>
      <br /><br />
        <code>adminUserDetailsUpdate</code>
      <br /><br />
       Update the details of an admin user (non-password)
    </td>
    <td>
      PUT
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:
      </b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Body Parameters:
      </b><br />
      <code>{ email, nameFirst, nameLast }</code>
      <br /><br />
      <b>Return Object:
      </b><br />
      <code>{}</code>
    </td>
    <td>
	  <b><code>{ error }</code> when any of: </b>
      <ul>
		    <li>token is empty (401),</li> 
        <li>token is invalid (token does not refer to valid logged in user session) (401)</li>
        <li>email is not in a valid email format (400)</li>
        <li>nameFirst is empty (400)</li>
        <li>nameLast is empty (400)</li>
	  </ul>
    </td>
  </tr>
   <tr>
    <td>
      <code>/v1/admin/user/password</code>
      <br /><br />
        <code>adminUserPasswordUpdate</code>
      <br /><br />
       Update the password of this admin user
    </td>
    <td>
      PUT
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:
      </b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Body Parameters:
      </b><br />
      <code>{ oldPassword, newPassword }</code>
      <br /><br />
      <b>Return Object:
      </b><br />
      <code>{}</code>
    </td>
    <td>
	  <b><code>{ error }</code> when any of: </b>
      <ul>
		    <li>token is empty (401),</li> 
        <li>token is invalid (token does not refer to valid logged in user session) (401)</li>
        <li>oldPassword is not the correct old password (400)</li>
        <li>newPassword is less than 8 characters long (400)</li>
        <li>newPassword contains no numbers (400)</li>
        <li>newPassword contains no uppercase letters (400)</li>
        <li>newPassword contains no lowercase letters (400)</li>
	  </ul>
    </td>
  </tr>
</table>

## adminQuiz

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:17%">HTTP Method</th>
    <th style="width:25%">Data Types</th>
    <th style="width:32%">Error Returns</th>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/list</code>
      <br /><br />
      <code>adminQuizList</code>
      <br /><br />
      List all user's quizzes
    </td>
    <td>
      GET
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ quizzes }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz</code>
      <br /><br />
      <code>adminQuizCreate</code>
      <br /><br />
      Create a new quiz
    </td>
    <td>
      POST
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Body Parameters:</b><br />
      <code>{ name, description }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ quizId }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>name or description is invalid (400)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/:quizid</code>
      <br /><br />
      <code>adminQuizRemove</code>
      <br /><br />
      Send a quiz to trash
    </td>
    <td>
      DELETE
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Path Parameters:</b><br />
      <code>{ quizid }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{}</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>quiz ID does not refer to a valid quiz (403)</li>
        <li>user is not the owner of this quiz (403)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/trash</code>
      <br /><br />
      <code>adminQuizViewTrash</code>
      <br /><br />
      View quizzes in trash
    </td>
    <td>
      GET
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ quizzes }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/:quizid</code>
      <br /><br />
      <code>adminQuizInfo</code>
      <br /><br />
      Get info about current quiz
    </td>
    <td>
      GET
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Path Parameters:</b><br />
      <code>{ quizid }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ quiz }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>quiz ID does not refer to a valid quiz (403)</li>
        <li>user is not the owner of this quiz (403)</li>
      </ul>
    </td>
  </tr>
</table>

## adminQuizQuestion

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:10%">HTTP Method</th>
    <th style="width:20%">Data Types</th>
    <th style="width:32%">Error Returns</th>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/:quizid/question</code>
      <br /><br />
      <code>adminQuizQuestionCreate</code>
      <br /><br />
      Create quiz question
    </td>
    <td>
      POST
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Path Parameters:</b><br />
      <code>{ quizid }</code>
      <br /><br />
      <b>Body Parameters:</b><br />
      <code>{ questionBody }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ questionId }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>quiz ID does not refer to a valid quiz (403)</li>
        <li>user is not the owner of this quiz (403)</li>
        <li>questionBody is invalid (400)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/:quizid/question
      /:questionid</code>
      <br /><br />
      <code>adminQuizQuestionUpdate</code>
      <br /><br />
      Update quiz question
    </td>
    <td>
      PUT
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Path Parameters:</b><br />
      <code>{ quizid, questionid }</code>
      <br /><br />
      <b>Body Parameters:</b><br />
      <code>{ questionBody }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{}</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>quiz ID does not refer to a valid quiz (403)</li>
        <li>user is not the owner of this quiz (403)</li>
        <li>question ID is invalid (400)</li>
        <li>questionBody is invalid (400)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/:quizid/question
      /:questionid</code>
      <br /><br />
      <code>adminQuizQuestionDelete</code>
      <br /><br />
      Delete quiz question
    </td>
    <td>
      DELETE
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Path Parameters:</b><br />
      <code>{ quizid, questionid }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{}</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>quiz ID does not refer to a valid quiz (403)</li>
        <li>user is not the owner of this quiz (403)</li>
        <li>question ID is invalid (400)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/:quizid/question
      /:questionid/move</code>
      <br /><br />
      <code>adminQuizQuestionMove</code>
      <br /><br />
      Move quiz question
    </td>
    <td>
      PUT
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Path Parameters:</b><br />
      <code>{ quizid, questionid }</code>
      <br /><br />
      <b>Body Parameters:</b><br />
      <code>{ newPosition }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{}</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>quiz ID does not refer to a valid quiz (403)</li>
        <li>user is not the owner of this quiz (403)</li>
        <li>question ID is invalid (400)</li>
        <li>newPosition is invalid (400)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>/v1/admin/quiz/:quizid/question
      /:questionid/duplicate</code>
      <br /><br />
      <code>adminQuizQuestionDuplicate</code>
      <br /><br />
      Duplicate quiz question
    </td>
    <td>
      POST
      <br /><br />
    </td>
    <td>
      <b>Header Parameters:</b><br />
      <code>{ token }</code>
      <br /><br />
      <b>Path Parameters:</b><br />
      <code>{ quizid, questionid }</code>
      <br /><br />
      <b>Return Object:</b><br />
      <code>{ newQuestionId }</code>
    </td>
    <td>
      <b><code>{ error }</code> when any of: </b>
      <ul>
        <li>token is invalid (401)</li>
        <li>quiz ID does not refer to a valid quiz (403)</li>
        <li>user is not the owner of this quiz (403)</li>
        <li>question ID is invalid (400)</li>
      </ul>
    </td>
  </tr>
</table>

# Planning of New Features

## General

- Block rude language
- support different systems
- support sync
- permission to view, moditify, duplicate and share quiz / question
- easter eggs for festivals
- achievements and leaderboard of achievements for encrouging
- notifications
- global competitions and activities rowing at the top of main page
- searching quiz / question / user with option plaintest or regex, created date, label
- cusom background of frontEnd, and night mode support
- change and use differnent language

## Admin

- display password strength when create
- ask for confirm email and password
- allow password hint and recover password questions
- forgetting and reset for email / password
- userProfile
  - decraction with achievements or skin in store
  - Introductions and last active, with custom seting of 'who can view'
- share notes (add questions in folders / notes, and add comments)
- delete a user
- send dm to other author
- add someone as friend, or block someone

## Questions

- allow picture, audio, texts with markdown of table, formula support for a question
- question pin, or invite to join
- custom music and music change speed with the duration length
- custom order and color of answers
- explaination can be included for each question
- allow replay of question
- reaction and feedback for a question
- optional changelog field of a question
- edit a message and showed as created and added
- allow meaasge, question pin for a question
- questions can be tagged with label
- chose mutiple answers of questions
- no duplicate color of answers in a question
- add question to my note or note in folder

## Players

- duplicate player name is not allowed
- allowing duplicate questions or quiz under branch if permission
- allwong non-regesiter to temportary join a quiz, with data maintain when register
- same ip are allow to join a questions twice
- like or unlike a question / quiz

## Problems to Solve

- effecientlfy of the program need to improve
- space useage may be too high with high amount of users
- using fs.readFileSync i.e synchronous operations assume low workload; otherwise, significant delay or failure due to external factors such as network latency or file system errors might happen.
- unknown maximum caoticapy of users, quizzes, questions, and players.
- unknown when under attack(s)
- function may or may not support over different webs and systems

# User Stories (3) (CHECK the specific of README)

# State Diagrams