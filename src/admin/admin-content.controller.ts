import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { SkipThrottle } from "@nestjs/throttler";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

class PostDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  excerpt?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  body!: string;

  @IsOptional()
  @IsIn(["draft", "published"])
  status?: string;
}

class JobDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  description!: string;

  @IsOptional()
  @IsIn(["draft", "published"])
  status?: string;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "item";
}

@SkipThrottle()
@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminContentController {
  constructor(private db: PrismaService) {}

  @Get("blog")
  posts() {
    return this.db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  }

  @Post("blog")
  async createPost(@Body() body: PostDto) {
    const status = body.status || "draft";
    try {
      return await this.db.blogPost.create({
        data: {
          title: body.title.trim(),
          slug: slugify(body.slug || body.title),
          excerpt: body.excerpt?.trim() || null,
          body: body.body,
          status,
          publishedAt: status === "published" ? new Date() : null,
        },
      });
    } catch (e: unknown) {
      if (typeof e === "object" && e && "code" in e && e.code === "P2002") {
        throw new ConflictException("A post with this slug already exists");
      }
      throw e;
    }
  }

  @Patch("blog/:id")
  async updatePost(@Param("id") id: string, @Body() body: PostDto) {
    const existing = await this.db.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Post not found");
    const status = body.status || existing.status;
    try {
      return await this.db.blogPost.update({
        where: { id },
        data: {
          title: body.title.trim(),
          slug: slugify(body.slug || body.title),
          excerpt: body.excerpt?.trim() || null,
          body: body.body,
          status,
          publishedAt: status === "published" ? existing.publishedAt ?? new Date() : existing.publishedAt,
        },
      });
    } catch (e: unknown) {
      if (typeof e === "object" && e && "code" in e && e.code === "P2002") {
        throw new ConflictException("A post with this slug already exists");
      }
      throw e;
    }
  }

  @Delete("blog/:id")
  async deletePost(@Param("id") id: string) {
    await this.db.blogPost.delete({ where: { id } }).catch(() => {
      throw new NotFoundException("Post not found");
    });
    return { ok: true };
  }

  @Get("jobs")
  jobs() {
    return this.db.job.findMany({ orderBy: { updatedAt: "desc" } });
  }

  @Post("jobs")
  async createJob(@Body() body: JobDto) {
    try {
      return await this.db.job.create({
        data: {
          title: body.title.trim(),
          slug: slugify(body.slug || body.title),
          description: body.description,
          status: body.status || "draft",
        },
      });
    } catch (e: unknown) {
      if (typeof e === "object" && e && "code" in e && e.code === "P2002") {
        throw new ConflictException("A job with this slug already exists");
      }
      throw e;
    }
  }

  @Patch("jobs/:id")
  async updateJob(@Param("id") id: string, @Body() body: JobDto) {
    const existing = await this.db.job.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Job not found");
    try {
      return await this.db.job.update({
        where: { id },
        data: {
          title: body.title.trim(),
          slug: slugify(body.slug || body.title),
          description: body.description,
          status: body.status || existing.status,
        },
      });
    } catch (e: unknown) {
      if (typeof e === "object" && e && "code" in e && e.code === "P2002") {
        throw new ConflictException("A job with this slug already exists");
      }
      throw e;
    }
  }

  @Delete("jobs/:id")
  async deleteJob(@Param("id") id: string) {
    await this.db.job.delete({ where: { id } }).catch(() => {
      throw new NotFoundException("Job not found");
    });
    return { ok: true };
  }
}
