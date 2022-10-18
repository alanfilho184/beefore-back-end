export default class UserServices {
    User: any;
    constructor(User: any);
    hashPassword(password: string): string;
    validateNewUser(newUser: User): void;
    verifyDuplicate(newUser: User): Promise<void>;
    verifyDuplicateModified(newUser: User): Promise<void>;
}
