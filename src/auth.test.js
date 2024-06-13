import {
    adminAuthRegister,
    adminAuthLogin,
    clear
  } from './auth.js';
  
beforeEach(()=> {
    clear();
});

describe('clear', () => {
    test('has the correct return type, {}', () => {
      expect(clear()).toStrictEqual({});
    });
});  

describe('adminAuthLogin', () => {
    test.todo('Test for email does not exist');

    test.todo('test for password input');
    // password doesn't match corresponding email.

    test.todo('Test for editSong return value (userID), behaviour and side effects');

});



/*

// You can remove or replace this with your own tests.
// TIP: you may want to explore "test.each"
describe('Example block of tests', () => {
  test('Example test 1', () => {
    expect(checkPassword('something')).toEqual('Poor Password');
  });

  test('Example test 2', () => {
    expect(checkPassword('not a good test')).toEqual('Poor Password');
  });
});


1. clear
2. importing files

2. creating acc 
3. username, password
4. returning the message
5. calling the function

*/
