import {
    adminAuthRegister,
    adminAuthLogin,
    clear
  } from './auth.js';
  
beforeEach(()=> {
    clear();
});

// remove this?
describe('clear', () => {
    test('has the correct return type, {}', () => {
      expect(clear()).toStrictEqual({});
    });
});

describe('adminAuthRegister', () => {
    describe('Email creation', () => {
        test('Valid Registeration', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPassw0rd", "Jane", "Smith");
            expect(result).toHaveProperty('authUserId');
        });

        test('Test for existing email address', () => {
            const result = adminAuthRegister("test@example.com", "MyPassw0rd", 
                                            "Jane", "Smith");
                                            // wtf is this error msg, idk anymore.
            expect(result).toHaveProperty('error', 'Email already exists');
        });
    
        test('Email does not satisfy string only', () => {
            const result = adminAuthRegister("123", "MyPassw0rd", 
                                            "Jane", "Smith");
            expect(result).toHaveProperty('error', 'Invalid email format');
        });
            // var validator = require('validator');
            // validator.isEmail('foo@bar.com');
    });

    describe('Username creation', () => {
        // NameFirst contains characters other than lowercase letters, 
        // uppercase letters, spaces, hyphens, or apostrophes.
        test('tests for invalid nameFirst input', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jan3", "Smith");
            expect(result).toHaveProperty('error', 'Contains invalid characters');
        });

        test('test for nameFirst length less than 2 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "J", "Smith");
            expect(result).toHaveProperty('error', 'Contains less than 2 characters');
        });  

        test('test for nameFirst length exceeding 20 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "JaneJaneJaneJaneJane", "Smith");
            expect(result).toHaveProperty('error', 'Exceeds 20 character limit');
        });       
        

        // nameLast
        test('tests for invalid nameLast input', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "5mith");
            expect(result).toHaveProperty('error', 'Contains invalid characters');
        });

        test('test for nameLast length less than 2 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "S");
            expect(result).toHaveProperty('error', 'Contains less than 2 characters');
        });  

        test('test for nameLast length exceeding 20 characters', () => {
            const result = adminAuthRegister("test@example.com", 
                                            "MyPasswOrd",
                                            "Jane", "SmithSmithSmithSmith");
            expect(result).toHaveProperty('error', 'Exceeds 20 character limit');
        });  

    });

    describe('Password creation', () => {
        test('Test for password length less than 8 characters', () => {
            expect(checkPassword("Pass123")).toEqual({ 
                "error": "Password is less than 8 characters."
            });    
        });
        
        test('Test for password missing a number', () => {
            expect(checkPassword("Password")).toEqual({ 
                "error": "Password must contain at least one number."
            });
        });

        test('Test for password missing a letter', () => {
            expect(checkPassword("12345678")).toEqual({ 
                "error": "Password must contain at least one letter." 
            });
        });  
    });
});