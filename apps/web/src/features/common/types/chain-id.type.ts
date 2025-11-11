import type { ResolvedRegister } from "wagmi";

export type ChainId = ResolvedRegister["config"]["chains"][number]["id"];
