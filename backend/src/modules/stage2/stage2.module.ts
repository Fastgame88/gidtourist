import { Module } from "@nestjs/common";
import { AdminKeyGuard, SessionGuard } from "../../common/auth.guard.js";
import { Stage2Controller } from "./stage2.controller.js";
import { Stage2Service } from "./stage2.service.js";

@Module({ controllers: [Stage2Controller], providers: [Stage2Service, SessionGuard, AdminKeyGuard] })
export class Stage2Module {}
