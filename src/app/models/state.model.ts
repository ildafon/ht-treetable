import { htHashItemC, htHashTableI } from "./fms.model";

export interface fmsStateObject {
    entities: htHashTableI;
    ids: string[];
    output: string[]
}