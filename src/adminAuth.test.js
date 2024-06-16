import {
    adminAuthRegister,
    adminAuthLogin,
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
            expect(result).toStrictEqual({authUserId: expect.any(Number)});
        });

        test('Test for existing email address', () => {
            const result1 = adminAuthRegister("test@example.com", 
                                            "MyPassw0rd", "Jane", "Smith");
            expect(result1).toStrictEqual({authUserId: expect.any(Number)});


            const result2 = adminAuthRegister("test@example.com", "MyPassw0rd1", 
                                            "Sarah", "Parker");
            expect(result2).toStrictEqual({error: 'Invalid email.'});
        });
    
        test('Email does not satisfy string only', () => {
            const result = adminAuthRegister("123", "MyPassw0rd", 
                                            "Jane", "Smith");
            expect(result).toStrictEqual({error: 'Invalid email.'});
        });
    });

    describe('Username creation', () => {
        // NameFirst
        test('Test for invalid nameFirst input (number)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jan3", "Smith");
            expect(result).toStrictEqual({error: 'Firstname does not meet requirements.'});
        });

        test('Test for invalid nameFirst input (@)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "J@ne", "Smith");
            expect(result).toStrictEqual({error: 'Firstname does not meet requirements.'});
        });  

        test('Test for invalid nameFirst input (#)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Ja#e", "Smith");
            expect(result).toStrictEqual({error: 'Firstname does not meet requirements.'});
        }); 

        test('Test for invalid nameFirst input (-)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Ja&ne", "Smith");
            expect(result).toStrictEqual({error: 'Firstname does not meet requirements.'});
        }); 

        test('Test for nameFirst length less than 2 characters', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "J", "Smith");
            expect(result).toStrictEqual({error: 'Firstname does not meet requirements.'});
        });  

        test('test for nameFirst length exceeding 20 characters', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "JaneJaneJaneJaneJanee", "Smith");
            expect(result).toStrictEqual({error: 'Firstname does not meet requirements.'});
        });        


        // nameLast
        test('tests for invalid nameLast input (number)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "5mith");
            expect(result).toStrictEqual({error: 'Lastname does not meet requirements.'});
        });

        test('Test for invalid nameLast input (@)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "Sm@th");
            expect(result).toStrictEqual({error: 'Lastname does not meet requirements.'});
        });  

        test('Test for invalid nameLast input (#)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "Sm#th");
            expect(result).toStrictEqual({error: 'Lastname does not meet requirements.'});
        }); 

        test('Test for invalid nameLast input (-)', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "Smi&th");
            expect(result).toStrictEqual({error: 'Lastname does not meet requirements.'});
        });

        test('test for nameLast length less than 2 characters', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "S");
            expect(result).toStrictEqual({error: 'Lastname does not meet requirements.'});
        });  

        test('test for nameLast length exceeding 20 characters', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "SmithSmithSmithSmiths");
            expect(result).toStrictEqual({error: 'Lastname does not meet requirements.'});
        });  
    });
        
    describe('Password creation - adminAuthRegister function', () => {
        test('Test for password length less than 8 characters', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "Smith");
            expect(result).toStrictEqual({error: 'Password does not meet requirements.'});    
        });

        test('Test for password length less than 8 characters', () => {
            const result = adminAuthRegister("test@example.com", "MyPasswOrd",
                                            "Jane", "Smith");
            expect(result).toStrictEqual({ 
                error: 'Password does not meet requirements.'});    
        });

        test('Test for password missing a number', () => {
            const result = adminAuthRegister("test@example.com", "MyPassword",
                                            "Jane", "Smith");
            expect(result).toStrictEqual({error: 'Password does not meet requirements.'});    
        });

        test('Test for password missing a letter', () => {
            const result = adminAuthRegister("test@example.com", "123456789",
                                            "Jane", "Smith");
            expect(result).toStrictEqual({error: 'Password does not meet requirements.'});    
        });
    });
});