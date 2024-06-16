import {
    adminAuthRegister,
    adminAuthLogin,
    isValidPassword
  } from './auth.js';

import {
    clear
} from './other.js'
  
beforeEach(()=> {
    clear();
});

describe('adminAuthRegister', () => {
    describe('Email creation', () => {
        test('Valid Registration', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPassw0rd", "Jane", "Smith");
            expect(result).toHaveProperty('authUserId');
        });

        test('Test for existing email address', () => {
            const result1 = adminAuthRegister("test@example.com", 
                                            "MyPassw0rd", "Jane", "Smith");
            expect(result1).toHaveProperty('authUserId');


            const result2 = adminAuthRegister("test@example.com", "MyPassw0rd1", 
                                            "Sarah", "Parker");
            expect(result2).toEqual({error: 'Invalid email.'});
        });
    
        test('Email does not satisfy string only', () => {
            const result = adminAuthRegister("123", "MyPassw0rd", 
                                            "Jane", "Smith");
            expect(result).toHaveProperty('error', 'Invalid email.');
        });
    });

    describe('Username creation', () => {
        // NameFirst
        test('Test for invalid nameFirst input', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jan3", "Smith");
            expect(result).toEqual({
                error: 'First name must: ' +
                'only contain letters, spaces, hyphens, or apostrophes' +
                'be atleast 2 characters' +
                'not exceed 20 character limit'
            });
        });

        test('Test for nameFirst length less than 2 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "J", "Smith");
            expect(result).toEqual({
                error: 'First name must: ' +
                'only contain letters, spaces, hyphens, or apostrophes' +
                'be atleast 2 characters' +
                'not exceed 20 character limit'
            });
        });  

        test('test for nameFirst length exceeding 20 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "JaneJaneJaneJaneJanee", "Smith");
            expect(result).toEqual({
                error: 'First name must: ' +
                'only contain letters, spaces, hyphens, or apostrophes' +
                'be atleast 2 characters' +
                'not exceed 20 character limit'
            });
        });       
        

        // nameLast
        test('tests for invalid nameLast input', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "5mith");
            expect(result).toEqual({
                error: 'Last name must: ' +
                'only contain letters, spaces, hyphens, or apostrophes' +
                'be atleast 2 characters' +
                'not exceed 20 character limit'
            });
        });

        test('test for nameLast length less than 2 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "S");
            expect(result).toEqual({
                error: 'Last name must: ' +
                'only contain letters, spaces, hyphens, or apostrophes' +
                'be atleast 2 characters' +
                'not exceed 20 character limit'
            });
        });  

        test('test for nameLast length exceeding 20 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "SmithSmithSmithSmiths");
            expect(result).toEqual({
                error: 'Last name must: ' +
                'only contain letters, spaces, hyphens, or apostrophes' +
                'be atleast 2 characters' +
                'not exceed 20 character limit'
            });
        });  
    });
        
    describe('Password creation - adminAuthRegister function', () => {
        test('Test for password length less than 8 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "Smith");
            expect(result).toEqual({ 
                error: 'Password must:' + 
                'be more than 8 characters' +
                'contain atleast one character' +
                'contain atleast one number'
            });    
        });

        test('Test for password length less than 8 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "Smith");
            expect(result).toEqual({ 
                error: 'Password must:' + 
                'be more than 8 characters' +
                'contain atleast one character' +
                'contain atleast one number'
            });    
        });

        test('Test for password missing a number', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPassword",
                                            "Jane", "Smith");
            expect(result).toEqual({ 
                error: 'Password must:' + 
                'be more than 8 characters' +
                'contain atleast one character' +
                'contain atleast one number'
            });    
        });

        test('Test for password missing a letter', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "123456789",
                                            "Jane", "Smith");
            expect(result).toEqual({ 
                error: 'Password must:' + 
                'be more than 8 characters' +
                'contain atleast one character' +
                'contain atleast one number'
            });    
        });
    });

    /*
    describe('Password creation - isValidPassword function', () => {
        test('Test for password length less than 8 characters', () => {
            const result = isValidPassword("Pass123");
            expect(result).toEqual({ 
                error: 'Password must:' + 
                'be more than 8 characters' +
                'contain atleast one character' +
                'contain atleast one number'
            });    
        });

        test('Test for password missing a number', () => {
            const result = isValidPassword("Password");
            expect(result).toEqual({ 
                error: 'Password must:' + 
                'be more than 8 characters' +
                'contain atleast one character' +
                'contain atleast one number'
            });
        });

        test('Test for password missing a letter', () => {
            const result = isValidPassword("12345678");
            expect(result).toEqual({ 
                error: 'Password must:' + 
                'be more than 8 characters' +
                'contain atleast one character' +
                'contain atleast one number' 
            });
        });  

        test('test for valid password input', () => {
            const result = isValidPassword("MyPasswOrd");
            expect(result).toBe(true);
        });
    });
    */
});