import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async login(email: string, password: string) {
    const expectedEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const expectedPassword = process.env.ADMIN_PASSWORD || "";
    const providedEmail = email.toLowerCase().trim();

    if (!expectedEmail || !expectedPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }
    if (!safeEqual(providedEmail, expectedEmail) || !safeEqual(password, expectedPassword)) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const roles = ["admin"];
    const accessToken = await this.jwt.signAsync({
      sub: "env-admin",
      email: expectedEmail,
      roles,
      permissions: [],
    });
    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      user: { id: "env-admin", email: expectedEmail, name: "Administrator", roles },
    };
  }
}
