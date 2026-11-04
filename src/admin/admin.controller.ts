import { Body, Controller, Get, Patch, Query, UseGuards, Req, Param, Res } from "@nestjs/common";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { SkipThrottle } from "@nestjs/throttler";
import { Response } from "express";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

class UpdateDto {
  @IsOptional()
  @IsString()
  @IsIn(["new", "contacted", "qualified", "converted", "closed", "spam"])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  internalNotes?: string;
}

@SkipThrottle()
@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private db: PrismaService) {}

  @Get("overview")
  async overview() {
    const [waitlist, contacts, newWaitlist, newContacts] = await Promise.all([
      this.db.waitlistEntry.count(),
      this.db.contact.count(),
      this.db.waitlistEntry.count({ where: { status: "new" } }),
      this.db.contact.count({ where: { status: "new" } }),
    ]);
    return { waitlist, contacts, newWaitlist, newContacts };
  }

  @Get("waitlist")
  async waitlist(@Query("q") q = "", @Query("status") status?: string) {
    return this.db.waitlistEntry.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { institution: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }

  @Get("contacts")
  async contacts(@Query("q") q = "", @Query("status") status?: string) {
    return this.db.contact.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { topic: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }

  @Patch("waitlist/:id")
  async updateWaitlist(@Param("id") id: string, @Body() b: UpdateDto, @Req() req: { user: { sub: string } }) {
    const row = await this.db.waitlistEntry.update({ where: { id }, data: b });
    await this.db.auditLog.create({
      data: {
        actorUserId: req.user.sub,
        action: "update",
        resourceType: "waitlist",
        resourceId: id,
        metadata: { status: b.status ?? null, internalNotes: b.internalNotes ?? null } as Prisma.InputJsonValue,
      },
    });
    return row;
  }

  @Patch("contacts/:id")
  async updateContact(@Param("id") id: string, @Body() b: UpdateDto, @Req() req: { user: { sub: string } }) {
    const row = await this.db.contact.update({ where: { id }, data: b });
    await this.db.auditLog.create({
      data: {
        actorUserId: req.user.sub,
        action: "update",
        resourceType: "contact",
        resourceId: id,
        metadata: { status: b.status ?? null, internalNotes: b.internalNotes ?? null } as Prisma.InputJsonValue,
      },
    });
    return row;
  }

  @Get("export/:kind")
  async exportCsv(@Param("kind") kind: string, @Res() res: Response) {
    const rows =
      kind === "waitlist"
        ? await this.db.waitlistEntry.findMany({ orderBy: { createdAt: "desc" } })
        : kind === "contacts"
          ? await this.db.contact.findMany({ orderBy: { createdAt: "desc" } })
          : null;
    if (!rows) return res.status(404).send("Not found");
    const keys = Object.keys(rows[0] || {}).filter((k) => k !== "internalNotes");
    const cell = (v: unknown) => {
      let s = v instanceof Date ? v.toISOString() : String(v ?? "");
      if (/^[=+\-@]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const csv = [keys.map(cell).join(","), ...rows.map((r) => keys.map((k) => cell((r as Record<string, unknown>)[k])).join(","))].join("\r\n");
    res.setHeader("content-type", "text/csv; charset=utf-8");
    res.setHeader("content-disposition", `attachment; filename=${kind}.csv`);
    return res.send(csv);
  }
}
