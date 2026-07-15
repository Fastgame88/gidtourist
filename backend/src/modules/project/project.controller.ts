import { Controller, Get } from "@nestjs/common";
import {
  CORE_FLOWS,
  PLATFORM_ROLES,
  STAGE_ONE_MODULES,
} from "./project.constants.js";

@Controller("project")
export class ProjectController {
  @Get("stage-one")
  getStageOne() {
    return {
      project: "Гід туриста",
      version: "0.1.0",
      stage: 1,
      status: "prototype",
      palette: ["#ffffff", "#0b9861", "#103b2d", "#ccec58"],
      screens: STAGE_ONE_MODULES.reduce(
        (total, module) => total + module.screens,
        0,
      ),
      modules: STAGE_ONE_MODULES,
      flows: CORE_FLOWS,
      productionData: false,
    };
  }

  @Get("roles")
  getRoles() {
    return { items: PLATFORM_ROLES };
  }

  @Get("modules")
  getModules() {
    return { items: STAGE_ONE_MODULES };
  }
}
