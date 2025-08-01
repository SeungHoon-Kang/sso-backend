import * as bcrypt from 'bcrypt';

export class utils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // 권장: 10~12
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}