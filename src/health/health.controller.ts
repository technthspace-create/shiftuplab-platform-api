import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

@Controller("health")
export class HealthController {
  @Get()
  @SkipThrottle()
  check() {
    return { status: "ok", service: "shiftuplab-platform-api", timestamp: new Date().toISOString() };
  }
}
