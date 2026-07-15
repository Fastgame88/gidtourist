import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module.js";
import { ProjectModule } from "./modules/project/project.module.js";

@Module({
  imports: [HealthModule, ProjectModule],
})
export class AppModule {}
