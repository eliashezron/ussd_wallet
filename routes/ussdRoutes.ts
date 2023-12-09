import ussdImplementation from "../controller/ussdController";
import { Router } from "express";

const ussdRouter = Router();

ussdRouter.post("/createWallet", ussdImplementation);